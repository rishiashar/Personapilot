import "server-only";

import { ELEVENLABS_MODEL_ID } from "@/lib/ai-config";

/**
 * Server-only ElevenLabs helper. The API key is read from the
 * ELEVENLABS_API_KEY environment variable and is never exposed to the browser.
 * Importing this file from a client component will fail the build thanks to
 * "server-only".
 *
 * We call the REST API directly with fetch instead of pulling in an SDK to keep
 * the dependency surface small and Vercel-friendly.
 */

const ELEVENLABS_TTS_ENDPOINT = "https://api.elevenlabs.io/v1/text-to-speech";

/** True when an ElevenLabs API key is configured in the environment. */
export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Synthesizes speech for the given text using ElevenLabs and returns the raw
 * MP3 audio. Throws when no key is configured or the request fails so the
 * caller can fall back to a text-only response.
 */
export async function synthesizeSpeech({
  text,
  voiceId,
}: {
  text: string;
  voiceId: string;
}): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const res = await fetch(
    `${ELEVENLABS_TTS_ENDPOINT}/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs request failed: ${res.status} ${res.statusText} ${detail}`.trim()
    );
  }

  return res.arrayBuffer();
}
