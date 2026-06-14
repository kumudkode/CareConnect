import { NextResponse } from "next/server";
import { mayaService, isGroqConfigured } from "@/lib/groq";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, action, userName } = body;

    // ── Action: Get Maya's intro message ──────────────────────────
    if (action === "introduce") {
      const intro = await mayaService.introduce(userName);
      return NextResponse.json({ reply: intro });
    }

    // ── Action: Regular chat ───────────────────────────────────────
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request: 'messages' must be an array." },
        { status: 400 }
      );
    }

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided." },
        { status: 400 }
      );
    }

    const reply = await mayaService.chat(messages);
    return NextResponse.json({ reply, model: isGroqConfigured ? "groq/llama-3.3-70b" : "demo" });

  } catch (error: any) {
    console.error("[/api/chat] Error:", error.message);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Maya is temporarily unavailable. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}
