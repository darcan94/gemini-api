import { GoogleGenerativeAIStream } from "@/app/utils/functions/ai";
import { GenerateContentStreamResult, GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'edge';

export const POST = async ( request: Request ) => {
    const contents = await request.json();

    const  { stream } : GenerateContentStreamResult = await genAI
            .getGenerativeModel({ model: "gemini-pro"})
            .generateContentStream({contents});

    return new Response(GoogleGenerativeAIStream(stream));
}