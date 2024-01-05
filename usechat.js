const useChat = ({
  api = "/api/chat",
  id,
  initialMessages = [],
  initialInput = "",
  sendExtraMessageFields,
  experimental_onFunctionCall,
  onResponse,
  onFinish,
  credentials,
  headers,
  body,
  generateId = nanoid,
} = {}) => {
  const hookId = React.useId();
  const idKey = id != null ? id : hookId;
  const chatKey = typeof api === "string" ? [api, idKey] : idKey;
  const [messages, mutate] = SWR.useSWR([chatKey, "messages"], null, {
    fallbackData: initialMessages,
  });
  const [isLoading, mutateLoading] = SWR.useSWR([chatKey, "loading"], null);
  const [streamData, mutateStreamData] = SWR.useSWR([chatKey, "streamData"], null);
  const messagesRef = React.useRef(messages || []);
  React.useEffect(() => {
    messagesRef.current = messages || [];
  }, [messages]);
  const abortControllerRef = React.useRef(null);
  const extraMetadataRef = React.useRef({
    credentials,
    headers,
    body,
  });
  React.useEffect(() => {
    extraMetadataRef.current = {
      credentials,
      headers,
      body,
    };
  }, [credentials, headers, body]);
  const triggerRequest = React.useCallback(async (chatRequest) => {
    mutateLoading(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await processChatStream({
      getStreamedResponse: () =>
        getStreamedResponse(
          api,
          chatRequest,
          mutate,
          mutateStreamData,
          streamData,
          extraMetadataRef,
          messagesRef,
          abortControllerRef,
          generateId,
          onFinish,
          onResponse,
          sendExtraMessageFields,
        ),
      experimental_onFunctionCall,
      updateChatRequest: (chatRequestParam) => {
        chatRequest = chatRequestParam;
      },
      getCurrentMessages: () => messagesRef.current,
    });
    abortControllerRef.current = null;
    mutateLoading(false);
  }, [
    mutate,
    mutateLoading,
    api,
    extraMetadataRef,
    onResponse,
    onFinish,
    mutateStreamData,
    streamData,
    sendExtraMessageFields,
    experimental_onFunctionCall,
    messagesRef,
    abortControllerRef,
    generateId,
  ]);
  const append = React.useCallback(
    async (message, { options, functions, function_call, data } = {}) => {
      if (!message.id) {
        message.id = generateId();
      }
      const chatRequest = {
        messages: messagesRef.current.concat(message),
        options,
        data,
        ...(functions !== void 0 && { functions }),
        ...(function_call !== void 0 && { function_call }),
      };
      return triggerRequest(chatRequest);
    },
    [triggerRequest, generateId],
  );
  const reload = React.useCallback(
    async ({ options, functions, function_call } = {}) => {
      if (messagesRef.current.length === 0) return null;
      const lastMessage = messagesRef.current[messagesRef.current.length - 1];
      if (lastMessage.role === "assistant") {
        const chatRequest = {
          messages: messagesRef.current.slice(0, -1),
          options,
          ...(functions !== void 0 && { functions }),
          ...(function_call !== void 0 && { function_call }),
        };
        return triggerRequest(chatRequest);
      }
      const chatRequest = {
        messages: messagesRef.current,
        options,
        ...(functions !== void 0 && { functions }),
        ...(function_call !== void 0 && { function_call }),
      };
      return triggerRequest(chatRequest);
    },
    [triggerRequest],
  );
  const stop = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);
  const setMessages = React.useCallback(
    (messages) => {
      mutate(messages, false);
      messagesRef.current = messages;
    },
    [mutate],
  );
  const [input, setInput] = React.useState(initialInput);
  const handleSubmit = React.useCallback(
    (e, options = {}, metadata) => {
      if (metadata) {
        extraMetadataRef.current = {
          ...extraMetadataRef.current,
          ...metadata,
        };
      }
      e.preventDefault();
      append(
        {
          content: input,
          role: "user",
          createdAt: new Date(),
        },
        options,
      );
      setInput("");
    },
    [input, append],
  );
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  return {
    messages: messages || [],
    append,
    reload,
    stop,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    data: streamData,
  };
};