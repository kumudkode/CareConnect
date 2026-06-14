import { NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages array in request body" },
        { status: 400 }
      );
    }

    const reply = await geminiService.chat(messages);
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat content" },
      { status: 500 }
    );
  }
}
