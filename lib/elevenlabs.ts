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

/** Runs a single shared-voices query and maps the result to candidates. */
async function fetchSharedVoices(
  apiKey: string,
  params: URLSearchParams
): Promise<ElevenLabsVoiceCandidate[]> {
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

  return (data.voices ?? []).map((v) => ({
    voice_id: v.voice_id,
    name: v.name,
    description: v.description,
    category: v.category,
    labels: v.labels ?? {},
    preview_url: v.preview_url,
  }));
}

/**
 * Searches the ElevenLabs shared voice library using the given criteria and
 * returns up to `limit` candidate voices.
 *
 * The shared-voices `search` param matches strictly, so a long phrase (e.g.
 * "casual friendly upbeat young adult student voice") usually returns nothing.
 * To reliably surface candidates we try progressively looser queries — a short
 * keyword search with filters, then filters only, then just the language — and
 * return the first non-empty result. This keeps automatic selection working
 * instead of silently falling back to the default voice.
 */
export async function searchElevenLabsVoices(
  criteria: VoiceSearchCriteria,
  limit = 10
): Promise<ElevenLabsVoiceCandidate[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const language = criteria.language?.trim() || "en";
  const useCase = criteria.use_cases[0]?.trim();
  // Keep the search to a few keywords; long phrases match nothing.
  const keywords = [criteria.search, ...criteria.descriptives]
    .filter((s): s is string => Boolean(s && s.trim()))
    .flatMap((s) => s.split(/\s+/))
    .filter(Boolean);
  const shortSearch = keywords.slice(0, 3).join(" ");

  const build = (parts: {
    search?: string;
    useCase?: string;
    language?: string;
    age?: VoiceSearchCriteria["age"];
    gender?: VoiceSearchCriteria["gender"];
  }): URLSearchParams => {
    const p = new URLSearchParams();
    p.set("page_size", String(limit));
    if (parts.search) p.set("search", parts.search);
    if (parts.useCase) p.set("use_cases", parts.useCase);
    if (parts.language) p.set("language", parts.language);
    // Only send age/gender when present; gender stays off by default so the
    // search is never biased by an inferred identity trait.
    if (parts.age) p.set("age", parts.age);
    if (parts.gender) p.set("gender", parts.gender);
    return p;
  };

  // Most specific -> least specific. First non-empty result wins.
  const attempts: URLSearchParams[] = [
    build({ search: shortSearch, useCase, language, age: criteria.age, gender: criteria.gender }),
    build({ search: shortSearch, useCase, language }),
    build({ useCase, language, age: criteria.age }),
    build({ useCase, language }),
    build({ language }),
  ];

  for (const params of attempts) {
    const candidates = await fetchSharedVoices(apiKey, params);
    if (candidates.length > 0) return candidates.slice(0, limit);
  }
  return [];
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
 * Synthesizes speech for the given text using ElevenLabs and returns the MP3
 * audio as a stream so the caller can forward bytes to the client as they
 * arrive instead of buffering the whole file. Throws when no key is configured
 * or the request fails so the caller can fall back to a text-only response.
 */
export async function synthesizeSpeechStream({
  text,
  voiceId,
}: {
  text: string;
  voiceId: string;
}): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured.");
  }

  const res = await fetch(
    `${ELEVENLABS_TTS_ENDPOINT}/${encodeURIComponent(voiceId)}/stream?output_format=mp3_44100_128`,
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

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `ElevenLabs request failed: ${res.status} ${res.statusText} ${detail}`.trim()
    );
  }

  return res.body;
}
