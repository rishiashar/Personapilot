import { NextResponse } from "next/server";
import { toFile } from "openai";

import { TRANSCRIPTION_MODEL } from "@/lib/ai-config";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

// Reject obviously-empty clips early (a fraction of a second of silence) so we
// don't spend a transcription call on noise.
const MIN_AUDIO_BYTES = 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart form data with an audio file." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "An audio file is required." },
      { status: 400 }
    );
  }
  if (file.size < MIN_AUDIO_BYTES) {
    return NextResponse.json(
      { error: "Recording was too short to transcribe." },
      { status: 400 }
    );
  }

  // No API key configured: tell the client transcription is unavailable so it
  // can prompt the researcher to type the question instead of breaking.
  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      { error: "Transcription is not configured." },
      { status: 503 }
    );
  }

  try {
    const uploadable = await toFile(file, file.name || "audio.webm", {
      type: file.type || "audio/webm",
    });
    const result = await client.audio.transcriptions.create({
      file: uploadable,
      model: TRANSCRIPTION_MODEL,
    });
    const text = (typeof result === "string" ? result : result.text)?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "Could not understand audio." },
        { status: 422 }
      );
    }
    return NextResponse.json({ text });
  } catch (error) {
    console.error("transcribe OpenAI error:", error);
    return NextResponse.json(
      { error: "Transcription failed." },
      { status: 502 }
    );
  }
}
