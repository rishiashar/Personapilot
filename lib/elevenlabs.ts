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
const ELEVENLABS_VOICES_ENDPOINT = "https://api.elevenlabs.io/v1/shared-voices";

/* ------------------------------------------------------------------ */
/* Voice search / selection helpers                                    */
/* ------------------------------------------------------------------ */

export interface VoiceSearchCriteria {
  search: string;
  age: "young" | "middle_aged" | "old" | null;
  gender: string | null;
  descriptives: string[];
  use_cases: string[];
  language: string;
}

export interface ElevenLabsVoiceCandidate {
  voice_id: string;
  name: string;
  description: string | null;
  category: string;
  labels: Record<string, string>;
  preview_url: string | null;
}

/**
 * Searches the ElevenLabs shared voice library using the given criteria and
 * returns up to `limit` candidate voices.
 */
export async function searchElevenLabsVoices(
  criteria: VoiceSearchCriteria,
  limit = 10
): Promise<ElevenLabsVoiceCandidate[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const params = new URLSearchParams();
  params.set("page_size", String(limit));
  if (criteria.search) params.set("search", criteria.search);
  if (criteria.gender) params.set("gender", criteria.gender);
  if (criteria.age) params.set("age", criteria.age);
  if (criteria.language) params.set("language", criteria.language);
  if (criteria.use_cases.length > 0)
    params.set("use_cases", criteria.use_cases.join(","));
  if (criteria.descriptives.length > 0)
    params.set("descriptives", criteria.descriptives.join(","));

  const res = await fetch(`${ELEVENLABS_VOICES_ENDPOINT}?${params.toString()}`, {
    method: "GET",
    headers: { "xi-api-key": apiKey },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs shared-voices request failed: ${res.status} ${res.statusText} ${detail}`.trim()
    );
  }

  const data = (await res.json()) as {
    voices: Array<{
      voice_id: string;
      name: string;
      description: string | null;
      category: string;
      labels: Record<string, string>;
      preview_url: string | null;
    }>;
  };

  return (data.voices ?? []).slice(0, limit).map((v) => ({
    voice_id: v.voice_id,
    name: v.name,
    description: v.description,
    category: v.category,
    labels: v.labels ?? {},
    preview_url: v.preview_url,
  }));
}

/**
 * Asks OpenAI to pick the best voice candidate for a persona from the provided
 * candidates. Returns `{ voiceId, voiceName, reason }` or null on failure.
 */
export async function selectBestVoiceCandidate(
  personaDescription: string,
  candidates: ElevenLabsVoiceCandidate[],
  openaiApiKey: string
): Promise<{ voiceId: string; voiceName: string; reason: string } | null> {
  if (candidates.length === 0) return null;

  // Lazy-import to avoid a circular dependency with server-only guards.
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: openaiApiKey });

  const candidateSummaries = candidates.map((c) => ({
    voice_id: c.voice_id,
    name: c.name,
    description: c.description,
    labels: c.labels,
    category: c.category,
  }));

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are choosing the best synthetic voice candidate for a UX research rehearsal persona.

Choose only from the provided candidates.
Do not invent a voice.
Do not use stereotypes.
Choose based on tone, pace, energy, description, use case, and fit with the persona's communication style.

Return JSON only:
{
  "voiceId": "…",
  "voiceName": "…",
  "reason": "…"
}`,
      },
      {
        role: "user",
        content: `Persona:\n${personaDescription}\n\nCandidate voices:\n${JSON.stringify(candidateSummaries, null, 2)}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as {
      voiceId?: string;
      voiceName?: string;
      reason?: string;
    };
    if (!parsed.voiceId) return null;
    return {
      voiceId: parsed.voiceId,
      voiceName: parsed.voiceName ?? "Unknown",
      reason: parsed.reason ?? "Best match for persona communication style.",
    };
  } catch {
    return null;
  }
}

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
