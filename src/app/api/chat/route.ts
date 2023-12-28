import { GenerateContentResult, GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const runtime = 'edge';

export const POST = async ( request: Request ) => {
    const contents = await request.json();

    const { response }: GenerateContentResult = await genAI
            .getGenerativeModel({ model: "gemini-pro"})
            .generateContent({contents});
 
    return NextResponse.json( response , { status: 200 })
}