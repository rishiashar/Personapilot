import { NextResponse } from "next/server";
import OpenAI from "openai";

import { DEFAULT_ELEVENLABS_VOICE_ID } from "@/lib/ai-config";
import {
  isElevenLabsConfigured,
  searchElevenLabsVoices,
  selectBestVoiceCandidate,
  type VoiceSearchCriteria,
} from "@/lib/elevenlabs";
import type { Persona, ResearchContext } from "@/lib/types";

export const runtime = "nodejs";

interface SelectVoiceBody {
  persona?: Persona;
  researchContext?: ResearchContext;
}

interface SearchCriteriaResponse {
  search: string;
  age: "young" | "middle_aged" | "old" | null;
  gender: string | null;
  descriptives: string[];
  use_cases: string[];
  language: string;
}

function fallbackResponse() {
  const fallbackId =
    process.env.ELEVENLABS_DEFAULT_VOICE_ID?.trim() ||
    DEFAULT_ELEVENLABS_VOICE_ID;
  return NextResponse.json({
    voiceId: fallbackId,
    voiceName: "Default voice",
    voiceSelectionReason: "Using default voice (automatic selection unavailable).",
    voiceSource: "default_fallback",
  });
}

export async function POST(request: Request) {
  let body: SelectVoiceBody;
  try {
    body = (await request.json()) as SelectVoiceBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const persona = body.persona;
  if (!persona) {
    return NextResponse.json(
      { error: "persona is required." },
      { status: 400 }
    );
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey || !isElevenLabsConfigured()) {
    return fallbackResponse();
  }

  // Build a text description of the persona for OpenAI prompts.
  const personaDescription = [
    `Name: ${persona.name}`,
    `Role: ${persona.role}`,
    persona.ageRange ? `Age range: ${persona.ageRange}` : "",
    persona.background ? `Background: ${persona.background}` : "",
    persona.behaviours ? `Behaviours: ${persona.behaviours}` : "",
    persona.voiceStyle ? `Voice style: ${persona.voiceStyle}` : "",
    persona.goals ? `Goals: ${persona.goals}` : "",
    persona.frustrations ? `Frustrations: ${persona.frustrations}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const researchContextText = body.researchContext
    ? [
        `Project: ${body.researchContext.projectName}`,
        `Goal: ${body.researchContext.researchGoal}`,
        `Product: ${body.researchContext.productContext}`,
        `Audience: ${body.researchContext.targetAudience}`,
      ]
        .filter((s) => s.split(": ")[1]?.trim())
        .join("\n")
    : "";

  // Step 1: Ask OpenAI to produce safe voice search criteria.
  let criteria: VoiceSearchCriteria;
  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are helping select a synthetic voice for a UX research rehearsal persona.

Given the persona and research context, create safe search criteria for the ElevenLabs voice library.

Use only communication and audio traits:
tone, pace, energy, age range if provided, role, communication style, use case, language.

Do not use race, ethnicity, nationality, religion, disability, or protected identity traits.

Return JSON only:
{
  "search": "short search phrase",
  "age": "young | middle_aged | old | null",
  "gender": null,
  "descriptives": ["calm", "natural"],
  "use_cases": ["conversational"],
  "language": "en"
}`,
        },
        {
          role: "user",
          content: `Persona:\n${personaDescription}${researchContextText ? `\n\nResearch context:\n${researchContextText}` : ""}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackResponse();

    const parsed = JSON.parse(raw) as SearchCriteriaResponse;
    criteria = {
      search: parsed.search ?? "",
      age: parsed.age ?? null,
      gender: parsed.gender ?? null,
      descriptives: Array.isArray(parsed.descriptives)
        ? parsed.descriptives
        : [],
      use_cases: Array.isArray(parsed.use_cases) ? parsed.use_cases : [],
      language: parsed.language ?? "en",
    };
  } catch (err) {
    console.error("select-voice: OpenAI criteria generation failed:", err);
    return fallbackResponse();
  }

  // Step 2: Search ElevenLabs for candidate voices.
  let candidates;
  try {
    candidates = await searchElevenLabsVoices(criteria, 10);
  } catch (err) {
    console.error("select-voice: ElevenLabs voice search failed:", err);
    return fallbackResponse();
  }

  if (candidates.length === 0) {
    return fallbackResponse();
  }

  // Step 3: Ask OpenAI to pick the best candidate.
  try {
    const best = await selectBestVoiceCandidate(
      personaDescription,
      candidates,
      openaiApiKey
    );

    if (!best) return fallbackResponse();

    // Verify the selected voice_id is actually one of the candidates.
    const valid = candidates.some((c) => c.voice_id === best.voiceId);
    if (!valid) return fallbackResponse();

    return NextResponse.json({
      voiceId: best.voiceId,
      voiceName: best.voiceName,
      voiceSelectionReason: best.reason,
      voiceSource: "elevenlabs_search",
    });
  } catch (err) {
    console.error("select-voice: OpenAI candidate ranking failed:", err);
    return fallbackResponse();
  }
}
