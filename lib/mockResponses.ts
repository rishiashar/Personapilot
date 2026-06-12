import type {
  AnswerKind,
  ExchangeInsight,
  InterviewMessage,
  InterviewSession,
  SessionAnalysis,
} from "@/lib/types";

/**
 * Temporary, rule-based participant responses for the MVP.
 * This will be replaced by an OpenAI-backed generator later.
 */

const UTILITY_KEYWORDS = ["where", "when", "how often", "use", "find", "open", "tool", "feature"];
const EMOTIONAL_KEYWORDS = [
  "feel",
  "stress",
  "frustrat",
  "overwhelm",
  "enjoy",
  "satisf",
  "confiden",
  "experience",
  "creative",
  "flow",
];

const UTILITY_ANSWERS = [
  "I usually open it when a client sends me a new brief or when I need to check where a project stands. I do not just browse around in it for fun.",
  "Mostly when deadlines are close, honestly. I will check my task list or look up file links, but day to day I am working in Figma, not in a project management tool.",
  "It depends on the project. If I am juggling three clients at once I check it every morning, but for a quieter week I might only open it a couple times.",
];

const EMOTIONAL_ANSWERS = [
  "When I have too many projects at once and things start falling through the cracks, I feel this low-level anxiety all day. A tool that helps me see everything in one place actually calms that down.",
  "Honestly I feel most creative when admin stuff is handled. If I spend the first hour of my day sorting tasks and chasing invoices I lose the energy I need for actual design work.",
  "There is a real satisfaction when I finish a sprint and can look back at what I shipped. But if the tool makes that invisible I do not get that feeling, so visibility matters to me.",
];

const VAGUE_ANSWERS = [
  "Sorry, can you be a bit more specific? Are you asking about the tool itself or about how I manage projects in general?",
  "Hmm, that is pretty broad. Could you narrow it down? Like, are you asking about a specific part of my workflow?",
  "I am not totally sure how to answer that one. Do you mean a particular feature, or just my overall experience with project management?",
];

const VAGUE_TRIGGERS = ["thoughts", "anything", "in general", "overall", "tell me about"];

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

/**
 * Returns a mock participant answer for a researcher question.
 * - Utility-style questions get a practical answer.
 * - Emotional-style questions get a more reflective answer.
 * - Very short / vague questions get a gently confused answer.
 */
export function generateMockResponse(question: string, turn = 0): string {
  const q = question.trim().toLowerCase();
  const wordCount = q.split(/\s+/).filter(Boolean).length;

  const isVagueLength = wordCount > 0 && wordCount <= 3;
  const isVagueTrigger = VAGUE_TRIGGERS.some((t) => q.includes(t));
  const isEmotional = EMOTIONAL_KEYWORDS.some((k) => q.includes(k));
  const isUtility = UTILITY_KEYWORDS.some((k) => q.includes(k));

  if (isEmotional) return pick(EMOTIONAL_ANSWERS, turn);
  if (isUtility) return pick(UTILITY_ANSWERS, turn);
  if (isVagueLength || isVagueTrigger) return pick(VAGUE_ANSWERS, turn);

  // Neutral fallback that still feels like a real participant.
  return pick(
    [
      "That is a good question. From my side, it really depends on the situation, but I will try to give you an honest example from my own experience.",
      "I can speak to that a little. It is not something I think about constantly, but when it comes up it does shape how I act day to day.",
      "Sure. I will answer based on what actually happens for me, even if it is not a perfect or polished example.",
    ],
    turn
  );
}

/** Heuristic read of what kind of answer a participant reply is. */
function classifyAnswer(answer: string): AnswerKind {
  const a = answer.trim().toLowerCase();
  const words = a.split(/\s+/).filter(Boolean).length;
  if (a.includes("?")) return "vague";
  if (words <= 6) return "yes_no";
  if (/\b(last time|yesterday|last week|this morning|recently|one time)\b/.test(a))
    return "story";
  if (/\b(feel|felt|honestly|anxiety|satisf|enjoy|frustrat|overwhelm)\b/.test(a))
    return "opinion";
  if (/\b(usually|every|when|check|open|use|depends)\b/.test(a))
    return "factual";
  return "opinion";
}

const EXCHANGE_READING: Record<
  AnswerKind,
  { learned: string; alignment: ExchangeInsight["alignment"] }
> = {
  story: {
    learned:
      "A concrete, recent example you can mine for real behaviour and context.",
    alignment: "on_goal",
  },
  factual: {
    learned:
      "Practical detail about when and how they act, but not the why behind it.",
    alignment: "partial",
  },
  opinion: {
    learned:
      "How they feel about it. Useful signal, but pair it with a follow-up for a concrete example.",
    alignment: "partial",
  },
  vague: {
    learned:
      "Nothing yet. The phrasing was broad enough that the participant asked you to narrow it down.",
    alignment: "off_goal",
  },
  yes_no: {
    learned:
      "A short, closed answer. It confirms a fact but opens no new ground.",
    alignment: "off_goal",
  },
};

/** Pair each researcher question with the reply that followed it. */
function buildExchanges(messages: InterviewMessage[]): ExchangeInsight[] {
  const exchanges: ExchangeInsight[] = [];
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (message.role !== "researcher") continue;
    const reply = messages
      .slice(i + 1)
      .find((m) => m.role === "participant");
    if (!reply) continue;
    const answerKind = classifyAnswer(reply.text);
    const reading = EXCHANGE_READING[answerKind];
    exchanges.push({
      question: message.text,
      answerKind,
      whatYouLearned: reading.learned,
      alignment: reading.alignment,
    });
  }
  return exchanges;
}

/**
 * Placeholder session analysis for the summary page.
 * Lightly references the session so the output feels session-aware,
 * but contains no real model output yet.
 */
export function buildSessionAnalysis(
  session: InterviewSession | null
): SessionAnalysis {
  const questions =
    session?.messages.filter((m) => m.role === "researcher").map((m) => m.text) ??
    [];

  const strongQuestions = questions
    .filter((q) => q.trim().split(/\s+/).length >= 6)
    .slice(0, 3);

  const weakQuestions = questions
    .filter((q) => q.trim().split(/\s+/).length <= 4)
    .slice(0, 3);

  return {
    exchanges: buildExchanges(session?.messages ?? []),
    strongQuestions:
      strongQuestions.length > 0
        ? strongQuestions
        : [
            "You asked open, specific questions that invited concrete examples.",
            "You gave the participant room to answer in their own words.",
          ],
    weakQuestions:
      weakQuestions.length > 0
        ? weakQuestions
        : [
            "A few prompts were broad enough that the participant had to guess your intent.",
          ],
    missedFollowUps: [
      "When the participant mentioned feeling scattered, you could have asked what their ideal morning workflow looks like.",
      "After a utility answer, you could have probed for a specific recent example from a real project.",
    ],
    suggestedImprovements: [
      "Instead of \"What do you think about the tool?\" try \"Walk me through the last time you checked on a project.\"",
      "Replace \"Do you like managing projects?\" with \"Tell me about a week when project management felt easy versus overwhelming.\"",
      "Follow vague answers with \"Can you give me a specific example from a recent client project?\"",
    ],
    nextInterviewTips: [
      "Open with an easy, concrete warm-up question before going deeper.",
      "Pause after answers to invite the participant to keep going.",
      "Prefer \"how\" and \"tell me about\" over yes/no phrasing.",
    ],
  };
}
