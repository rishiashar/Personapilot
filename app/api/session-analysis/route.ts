import { NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

import { SESSION_ANALYSIS_MODEL } from "@/lib/ai-config";
import { getOpenAIClient } from "@/lib/openai";
import { buildSessionAnalysis } from "@/lib/mockResponses";
import type {
  InterviewMessage,
  InterviewSession,
  Persona,
  ResearchContext,
  SessionAnalysis,
} from "@/lib/types";

export const runtime = "nodejs";

interface SessionAnalysisBody {
  persona?: Persona;
  researchContext?: ResearchContext;
  messages?: InterviewMessage[];
}

const SYSTEM_PROMPT = `You are a senior UX research coach reviewing a practice interview.

Your job is to help the researcher improve their interview technique.

Analyze the transcript based on:
- Question clarity
- Openness
- Depth of participant response
- Missed follow ups
- Alignment with the research goal
- Whether the questions produced functional, emotional, behavioural, or surface level answers

Do not be overly polite.
Be clear, practical, and specific.
Reference the actual transcript when possible (quote or paraphrase the researcher's questions).

Return structured JSON only with these keys, each an array of short strings written for a UX researcher:
strongQuestions
weakQuestions
missedFollowUps
suggestedImprovements
nextInterviewTips`;

function buildTranscript(messages: InterviewMessage[]): string {
  return messages
    .map((m) => `${m.role === "researcher" ? "Researcher" : "Participant"}: ${m.text}`)
    .join("\n");
}

function buildUserPrompt(
  persona: Persona,
  context: ResearchContext,
  messages: InterviewMessage[]
): string {
  return `Research goal: ${context.researchGoal || "(not provided)"}
Project: ${context.projectName || "(not provided)"}
Product context: ${context.productContext || "(not provided)"}
Target audience: ${context.targetAudience || "(not provided)"}
Key learning goals: ${context.keyLearningGoals || "(not provided)"}

Participant persona: ${persona.name}, ${persona.role}. ${persona.background}

Transcript:
${buildTranscript(messages)}`;
}

/** Coerce an unknown value into an array of non-empty trimmed strings. */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function parseAnalysis(raw: string): SessionAnalysis | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const analysis: SessionAnalysis = {
    strongQuestions: toStringArray(obj.strongQuestions),
    weakQuestions: toStringArray(obj.weakQuestions),
    missedFollowUps: toStringArray(obj.missedFollowUps),
    suggestedImprovements: toStringArray(obj.suggestedImprovements),
    nextInterviewTips: toStringArray(obj.nextInterviewTips),
  };
  // Require at least some content so we don't surface an empty report.
  const total =
    analysis.strongQuestions.length +
    analysis.weakQuestions.length +
    analysis.missedFollowUps.length +
    analysis.suggestedImprovements.length +
    analysis.nextInterviewTips.length;
  return total > 0 ? analysis : null;
}

export async function POST(request: Request) {
  let body: SessionAnalysisBody;
  try {
    body = (await request.json()) as SessionAnalysisBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { persona, researchContext, messages = [] } = body;

  if (!persona || !researchContext) {
    return NextResponse.json(
      { error: "persona and researchContext are required." },
      { status: 400 }
    );
  }

  // Rebuild a minimal session object for the mock fallback generator.
  const fallbackSession = {
    messages,
    persona,
    researchContext,
  } as InterviewSession;

  const client = getOpenAIClient();

  // No API key configured: gracefully fall back to the placeholder analysis.
  if (!client) {
    return NextResponse.json({
      analysis: buildSessionAnalysis(fallbackSession),
      fallback: true,
    });
  }

  const chatMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: buildUserPrompt(persona, researchContext, messages),
    },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: SESSION_ANALYSIS_MODEL,
      messages: chatMessages,
      max_completion_tokens: 900,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    const analysis = content ? parseAnalysis(content) : null;
    if (!analysis) {
      return NextResponse.json({
        analysis: buildSessionAnalysis(fallbackSession),
        fallback: true,
      });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("session-analysis OpenAI error:", error);
    return NextResponse.json({
      analysis: buildSessionAnalysis(fallbackSession),
      fallback: true,
    });
  }
}
