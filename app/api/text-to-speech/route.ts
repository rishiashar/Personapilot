import { NextResponse } from "next/server";

import { DEFAULT_ELEVENLABS_VOICE_ID } from "@/lib/ai-config";
import {
  isElevenLabsConfigured,
  synthesizeSpeechStream,
} from "@/lib/elevenlabs";

export const runtime = "nodejs";

interface TextToSpeechBody {
  text?: string;
  voiceId?: string;
}

export async function POST(request: Request) {
  let body: TextToSpeechBody;
  try {
    body = (await request.json()) as TextToSpeechBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  // No API key configured: tell the client voice is unavailable so it can show
  // the text-only fallback instead of breaking the session.
  if (!isElevenLabsConfigured()) {
    return NextResponse.json(
      { error: "Voice is not configured." },
      { status: 503 }
    );
  }

  // Precedence: per-request voiceId > ELEVENLABS_DEFAULT_VOICE_ID env override
  // (set on Vercel without a code change) > the centralized config default.
  const voiceId =
    body.voiceId?.trim() ||
    process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim() ||
    DEFAULT_ELEVENLABS_VOICE_ID;

  try {
    const audio = await synthesizeSpeechStream({ text, voiceId });
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("text-to-speech ElevenLabs error:", error);
    return NextResponse.json(
      { error: "Voice generation failed." },
      { status: 502 }
    );
  }
}
