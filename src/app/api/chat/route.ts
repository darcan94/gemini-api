import { GenerateContentResult, GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const POST = async ( request: Request ) => {
    const messages = await request.json();
    console.log(messages)
    const msg = messages.pop();
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    
    const chat = model.startChat({
        history: messages,
        generationConfig: {
            maxOutputTokens: 500,
        },
    });

    const result: GenerateContentResult = await chat.sendMessage(msg.parts);
    const response = result.response;
   // console.log(result);
    return NextResponse.json( response , { status: 200 })
}