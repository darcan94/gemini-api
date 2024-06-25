'use client'
import { useAutoScroll } from "@/app/hooks/useScroll";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { IMessage } from "@/app/definitions/definitions";
import Message from "@/app/components/ui/message";

const generateId = () => nanoid(7);
export default function Chat(){
    const formRef = useRef<HTMLFormElement>(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setLoading] = useState(false);
    const chatListRef = useAutoScroll(messages);    

    const handleKeyDown = (evt: KeyboardEvent<HTMLTextAreaElement>): void => {
        if (evt.key === "Enter" && !evt.shiftKey) {
          formRef.current?.requestSubmit();
          evt.preventDefault();
        }
    }

    function handleSubmit(evt: FormEvent<HTMLFormElement>){
        evt.preventDefault()
        setLoading(true);
        const newMessage: IMessage = {
            id: generateId(),
            role: 'user', 
            content: input,
            createdAt: new Date()
        }
        const newMessages: IMessage[] = [...messages, newMessage ];
        setMessages(newMessages);
        setInput('');
        sendPrompts(newMessages);
    }

    const sendPrompts = async (messages: IMessage[]) => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify(messages)
        });
        
        if(!response.ok){
            throw new Error(
                await response.text() || "Failed to fetch the chat response."
            );
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let receivedData = await reader?.read();
        let text = '';
        while(!receivedData?.done){
            text += decoder.decode(receivedData?.value);
            setMessages([
                ...messages,
                {role: 'model', content: text}
            ])
            receivedData = await reader?.read();
        }  
        setLoading(false);
    }

    return (
        <div className="w-8/12 h-full mx-auto flex flex-col justify-end gap-5">
            <div ref={chatListRef} className="overflow-y-auto">
                { messages.map((message, i) => <Message key={i} message={message} />) }
            </div>
            <div className="sticky bottom-1">
                <form ref={formRef} className="flex justify-center gap-1" onSubmit={handleSubmit}>
                    <textarea
                        autoFocus={true}
                        rows={1}
                        className="textarea w-11/12 resize-none px-4 py-[.5rem] text-font outline-none sm:text-sm"
                        onKeyDown={(evt) => handleKeyDown(evt)}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Send a message"
                        disabled={isLoading}>
                    </textarea>
                    <button disabled={isLoading || input===''} type='submit' className="btn btn-primary">Send</button>
                </form>
            </div>
        </div>
    );
}