import { NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file, mimeType, text } = body;

    if (!file && !text) {
      return NextResponse.json(
        { error: "Missing required content: provide either a file (base64) or text content" },
        { status: 400 }
      );
    }

    const analysis = await geminiService.analyzeReport(file || "", mimeType || "", text);
    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("Error in medical report route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze clinical report" },
      { status: 500 }
    );
  }
}
