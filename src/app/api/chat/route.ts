import { IMessage } from "@/app/definitions/definitions";
import { generativeAIStream } from "@/app/utils/functions/ai";
import { GenerateContentStreamResult, GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'edge';

const buildGoogleGenAiprompt = (messages: IMessage[]) => ({
    contents: messages.map(message => ({
                role: message.role,
                parts: [{text: message.content}]
              }))
    });

export const POST = async ( request: Request ) => {
    const contents = await request.json();

    const  { stream } : GenerateContentStreamResult = await genAI
            .getGenerativeModel({ model: "gemini-pro"})
            .generateContentStream(buildGoogleGenAiprompt(contents));

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
        async start(controller){
            for await (const chunk of stream){
                const chunkText = chunk.text();
                controller.enqueue(encoder.encode(chunkText));
            }
            controller.close();
        }
    });

    return new Response(readableStream, { 
        headers: { 'Content-Type': 'text/plain'}
    });
}