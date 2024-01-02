export function GoogleGenerativeAIStream(response: AsyncGenerator<any>) {
    return readableFromAsyncIterable(streamable2(response))
}

function readableFromAsyncIterable<T>(iterable: AsyncIterable<T>) {
    const it = iterable[Symbol.asyncIterator]();
    return new ReadableStream({
      async pull(controller) {
        const { done, value } = await it.next();
        if (done)
          controller.close();
        else
          controller.enqueue(value);
      },
      async cancel(reason) {
        await it.return?.(reason);
      }
    });
}

async function* streamable2(response: AsyncGenerator<any>): AsyncGenerator<string> {
    for await (const chunk of response) {
        const parts = chunk.candidates[0].content?.parts;

        if (parts === undefined) {
            continue;
        }
        const firstPart = parts[0];
        if (typeof firstPart.text === "string") {
            yield firstPart.text;
        }
    }
}