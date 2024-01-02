import { GenerateContentStreamResult, GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'edge';

export const POST = async ( request: Request ) => {
    const contents = await request.json();

    const  { stream } : GenerateContentStreamResult = await genAI
            .getGenerativeModel({ model: "gemini-pro"})
            .generateContentStream({contents});

    return new Response(GoogleGenerativeAIStream(stream));
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


function GoogleGenerativeAIStream(response: AsyncGenerator<any>) {
    return readableFromAsyncIterable(streamable2(response))
}

class StreamingTextResponse extends Response {
    constructor(res: ReadableStream, init?: ResponseInit, data?: any) {
        let processedStream = res;

        if (data) {
            processedStream = res.pipeThrough(data.stream);
        }

        const headers = new Headers(init?.headers);
        headers.set("Content-Type", "text/plain; charset=utf-8");
        headers.set("X-Experimental-Stream-Data", data ? "true" : "false");

        super(processedStream, {...init, status: 200, headers });
    }
};