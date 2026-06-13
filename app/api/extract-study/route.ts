import { NextResponse } from "next/server";

import { STUDY_EXTRACTION_MODEL } from "@/lib/ai-config";
import {
  extractDocumentText,
  isAcceptedDocument,
  MAX_DOC_BYTES,
} from "@/lib/documentText";
import { getOpenAIClient } from "@/lib/openai";

export const runtime = "nodejs";

/** Cap the text we send to the model; briefs longer than this are trimmed. */
const MAX_TEXT_CHARS = 24_000;

interface ExtractedContext {
  projectName: string;
  researchGoal: string;
  productContext: string;
  targetAudience: string;
  keyLearningGoals: string;
}

interface ExtractedPersona {
  name: string;
  role: string;
  ageRange: string;
  background: string;
  behaviours: string;
  goals: string;
  frustrations: string;
  voiceStyle: string;
}

interface ExtractedStudy {
  context: ExtractedContext;
  persona: ExtractedPersona;
  questions: string[];
}

const EMPTY_CONTEXT: ExtractedContext = {
  projectName: "",
  researchGoal: "",
  productContext: "",
  targetAudience: "",
  keyLearningGoals: "",
};

const EMPTY_PERSONA: ExtractedPersona = {
  name: "",
  role: "",
  ageRange: "",
  background: "",
  behaviours: "",
  goals: "",
  frustrations: "",
  voiceStyle: "",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Strip bullet/number prefixes and drop empties, preserving order. */
function toQuestionLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) =>
      line.replace(/^\s*(?:[-*•–·]|\(?\d+[.)]?|Q\d+[:.)]?)\s*/i, "").trim()
    )
    .filter((line) => line.length > 2);
}

const SYSTEM_PROMPT = `You read a UX research document (a research brief, discussion guide, study plan, or notes) and extract a structured study setup for a rehearsal tool.

Return JSON only, with exactly this shape:
{
  "context": {
    "projectName": "",
    "researchGoal": "",
    "productContext": "",
    "targetAudience": "",
    "keyLearningGoals": ""
  },
  "persona": {
    "name": "",
    "role": "",
    "ageRange": "",
    "background": "",
    "behaviours": "",
    "goals": "",
    "frustrations": "",
    "voiceStyle": ""
  },
  "questions": []
}

Rules:
- Only use information present in the document. Do NOT invent names, ages, products, or facts. If the document does not mention a field, return an empty string for it (or an empty array for questions).
- "questions" is the list of interview questions in the order they appear, one string each, with any numbering or bullet prefixes removed.
- "projectName" should be a short title for the study.
- "persona" describes the participant being interviewed. If the document only describes a target audience and not a single named participant, leave persona.name empty but you may fill role/background/behaviours from the audience description.
- "voiceStyle" describes how the participant speaks (tone, pace, vocabulary) if the document gives any hint; otherwise leave it empty.
- Do not use any dashes (em or en) in your output; use commas or "to" instead.
- Keep each field concise and faithful to the source.`;

function sanitize(parsed: unknown, fallbackQuestions: string[]): ExtractedStudy {
  const root = (parsed ?? {}) as Record<string, unknown>;
  const ctx = (root.context ?? {}) as Record<string, unknown>;
  const per = (root.persona ?? {}) as Record<string, unknown>;
  const rawQuestions = Array.isArray(root.questions) ? root.questions : [];
  const questions = rawQuestions
    .map((q) => str(q))
    .filter((q) => q.length > 2);

  return {
    context: {
      projectName: str(ctx.projectName),
      researchGoal: str(ctx.researchGoal),
      productContext: str(ctx.productContext),
      targetAudience: str(ctx.targetAudience),
      keyLearningGoals: str(ctx.keyLearningGoals),
    },
    persona: {
      name: str(per.name),
      role: str(per.role),
      ageRange: str(per.ageRange),
      background: str(per.background),
      behaviours: str(per.behaviours),
      goals: str(per.goals),
      frustrations: str(per.frustrations),
      voiceStyle: str(per.voiceStyle),
    },
    questions: questions.length > 0 ? questions : fallbackQuestions,
  };
}

/** Read the document text from either a multipart upload or a JSON paste. */
async function readSource(
  request: Request
): Promise<{ text: string } | { error: string; status: number }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: { text?: string };
    try {
      body = (await request.json()) as { text?: string };
    } catch {
      return { error: "Invalid JSON body.", status: 400 };
    }
    const text = (body.text ?? "").trim();
    if (text.length < 20) {
      return { error: "Paste a bit more text so we can read your study.", status: 422 };
    }
    return { text };
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return { error: "Expected a document file or pasted text.", status: 400 };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "A document file is required.", status: 400 };
  }
  if (file.size > MAX_DOC_BYTES) {
    return { error: "File is too large. Keep it under 10 MB.", status: 413 };
  }
  if (!isAcceptedDocument(file.name)) {
    return {
      error: "Unsupported file type. Use PDF, DOCX, TXT, or Markdown.",
      status: 415,
    };
  }

  try {
    const text = await extractDocumentText(file);
    return { text };
  } catch (error) {
    console.error("extract-study: document read failed:", error);
    return { error: "Could not read that document.", status: 502 };
  }
}

export async function POST(request: Request) {
  const source = await readSource(request);
  if ("error" in source) {
    return NextResponse.json(
      { error: source.error },
      { status: source.status }
    );
  }

  const text = source.text;
  if (text.trim().length === 0) {
    return NextResponse.json(
      { error: "No readable text found in that document." },
      { status: 422 }
    );
  }

  const fallbackQuestions = toQuestionLines(text);
  const client = getOpenAIClient();

  // No API key: still help by importing the questions we can detect.
  if (!client) {
    return NextResponse.json({
      context: EMPTY_CONTEXT,
      persona: EMPTY_PERSONA,
      questions: fallbackQuestions,
      llmAvailable: false,
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: STUDY_EXTRACTION_MODEL,
      response_format: { type: "json_object" },
      max_completion_tokens: 1500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Document:\n\n${text.slice(0, MAX_TEXT_CHARS)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({
        context: EMPTY_CONTEXT,
        persona: EMPTY_PERSONA,
        questions: fallbackQuestions,
        llmAvailable: true,
      });
    }

    const study = sanitize(JSON.parse(raw), fallbackQuestions);
    return NextResponse.json({ ...study, llmAvailable: true });
  } catch (error) {
    console.error("extract-study: extraction failed:", error);
    // The document was readable; degrade to detected questions only.
    return NextResponse.json({
      context: EMPTY_CONTEXT,
      persona: EMPTY_PERSONA,
      questions: fallbackQuestions,
      llmAvailable: true,
    });
  }
}
