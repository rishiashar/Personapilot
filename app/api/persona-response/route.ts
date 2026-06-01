import { NextResponse } from "next/server";
import type {
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

import { PERSONA_RESPONSE_MODEL } from "@/lib/ai-config";
import { getOpenAIClient } from "@/lib/openai";
import { generateMockResponse } from "@/lib/mockResponses";
import type {
  InterviewMessage,
  Persona,
  ResearchContext,
} from "@/lib/types";

export const runtime = "nodejs";

interface PersonaResponseBody {
  persona?: Persona;
  researchContext?: ResearchContext;
  messages?: InterviewMessage[];
  latestQuestion?: string;
  // Voice Mode: shorten spoken answers so playback stays snappy.
  voiceMode?: boolean;
}

function buildSystemPrompt(
  persona: Persona,
  context: ResearchContext,
  voiceMode: boolean
): string {
  const base = `You are role playing as a UX research participant.

You are not an AI assistant.
You are not helping the researcher improve their questions directly.
You are participating in an interview.

Respond only as the participant.

Persona:
- Name: ${persona.name}
- Role: ${persona.role}
- Age range: ${persona.ageRange}
- Background: ${persona.background}
- Behaviours: ${persona.behaviours}
- Goals: ${persona.goals}
- Frustrations: ${persona.frustrations}
- Voice style: ${persona.voiceStyle}

Research context:
- Project: ${context.projectName}
- Research goal: ${context.researchGoal}
- Product context: ${context.productContext}
- Target audience: ${context.targetAudience}
- Key learning goals: ${context.keyLearningGoals}

Behaviour rules:
- Answer naturally in first person.
- Stay consistent with the persona.
- If the question is practical, give a practical answer.
- If the question asks about feelings or experiences, give a more reflective answer.
- If the question is vague or confusing, ask for clarification.
- If the question is leading, answer naturally but do not simply agree.
- Do not give overly perfect research insights.
- Do not summarize like a researcher.
- Do not say you are an AI.
- Keep most answers between 2 and 5 sentences.`;

  if (!voiceMode) return base;

  // Spoken interview: keep answers short so the synthesized voice plays back
  // quickly and the rehearsal stays conversational.
  return `${base}

Voice mode (spoken interview):
- Keep answers to 1-3 short sentences.
- Sound conversational, like talking out loud.
- Only give a longer answer if the researcher explicitly asks for detail.`;
}

export async function POST(request: Request) {
  let body: PersonaResponseBody;
  try {
    body = (await request.json()) as PersonaResponseBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const {
    persona,
    researchContext,
    messages = [],
    latestQuestion,
    voiceMode = false,
  } = body;

  if (!latestQuestion || latestQuestion.trim().length === 0) {
    return NextResponse.json(
      { error: "latestQuestion is required." },
      { status: 400 }
    );
  }
  if (!persona || !researchContext) {
    return NextResponse.json(
      { error: "persona and researchContext are required." },
      { status: 400 }
    );
  }

  const turn = messages.filter((m) => m.role === "participant").length;
  const client = getOpenAIClient();

  // No API key configured: gracefully fall back to the mock generator so the
  // interview keeps working in local/dev environments without a key.
  if (!client) {
    return NextResponse.json({
      response: generateMockResponse(latestQuestion, turn),
      fallback: true,
    });
  }

  const history: ChatCompletionMessageParam[] = messages.map((m) => ({
    role: m.role === "researcher" ? "user" : "assistant",
    content: m.text,
  }));

  const chatMessages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: buildSystemPrompt(persona, researchContext, voiceMode),
    },
    ...history,
    { role: "user", content: latestQuestion },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: PERSONA_RESPONSE_MODEL,
      messages: chatMessages,
      max_completion_tokens: voiceMode ? 180 : 320,
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      return NextResponse.json({
        response: generateMockResponse(latestQuestion, turn),
        fallback: true,
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    // Keep the interview alive: fall back to the mock generator on any error.
    console.error("persona-response OpenAI error:", error);
    return NextResponse.json({
      response: generateMockResponse(latestQuestion, turn),
      fallback: true,
    });
  }
}
