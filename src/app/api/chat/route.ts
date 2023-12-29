import { GenerateContentResponse, GenerateContentResult, GenerateContentStreamResult, GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'edge';

export const POST = async ( request: Request ) => {
    const contents = await request.json();

    const  response : GenerateContentStreamResult = await genAI
            .getGenerativeModel({ model: "gemini-pro"})
            .generateContentStream({contents});
    
    //for await(const chunk of response.stream) {
    //    console.log(chunk.candidates![0].content);
   // }
    const stream = GoogleGenerativeAIStream(response);
    console.log(stream)
    return NextResponse.json( await response.response , { status: 200 })
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

  
async function* streamable2(response: any): AsyncGenerator<string> {
    for await (const chunk of response.stream) {
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


function GoogleGenerativeAIStream(response: any, cb = null) {
    return readableFromAsyncIterable(streamable2(response))
}

var StreamingTextResponse = class extends Response {
    constructor(res: any, init: any, data: any) {
        let processedStream = res;
        if (data) {
            processedStream = res.pipeThrough(data.stream);
        }
        super(processedStream, {
            ...init,
            status: 200,
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                ["X-Experimental-Stream-Data"]: data ? "true" : "false",
                ...init == null ? void 0 : init.headers
            }
        });
    }
};
/*async function* streamable(stream: any) {
  for await (const chunk of stream) {
    if ("completion" in chunk) {
      const text = chunk.completion;
      if (text)
        yield text;
    } else if ("delta" in chunk) {
      const { delta } = chunk;
      if ("text" in delta) {
        const text = delta.text;
        if (text)
          yield text;
      }
    }
  }
}*/