import { NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { file, mimeType } = body;

    if (!file || !mimeType) {
      return NextResponse.json(
        { error: "Missing required parameters: file (base64 string) and mimeType" },
        { status: 400 }
      );
    }

    const medicines = await geminiService.extractPrescription(file, mimeType);
    return NextResponse.json({ medicines });
  } catch (error: any) {
    console.error("Error in prescription extractor route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze prescription" },
      { status: 500 }
    );
  }
}
