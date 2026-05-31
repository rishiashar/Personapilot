import type {
  InterviewSession,
  Persona,
  SessionAnalysis,
} from "@/lib/types";

/**
 * Temporary, rule-based participant responses for the MVP.
 * This will be replaced by an OpenAI-backed generator later.
 */

const UTILITY_KEYWORDS = ["where", "when", "how often", "use", "find", "open"];
const EMOTIONAL_KEYWORDS = [
  "feel",
  "belonging",
  "belong",
  "pride",
  "proud",
  "connected",
  "connection",
  "experience",
  "lonely",
];

const UTILITY_ANSWERS = [
  "I mostly use it when I need something specific, like checking a link, finding a service, or figuring out where something is. I do not really open it randomly.",
  "Usually only when I have to, honestly. If I need to check a deadline on Quercus or find a building on the campus map, I will open it, but otherwise it just sits there.",
  "It depends on the week. Before class I will quickly check links or schedules, but I am not someone who browses these tools for fun.",
];

const EMOTIONAL_ANSWERS = [
  "As a commuter, I sometimes feel like I come to campus only for class and then leave. I feel connected during events or when something makes me feel like I am part of the university, but that does not happen every day.",
  "Honestly it comes and goes. Some days I feel like I belong, especially when I run into people I know, but other days I feel a bit like a visitor who is just passing through.",
  "I think I want to feel more settled here. When something helps me feel included, like a club event or a friendly orientation thing, it really matters, but I do not get that feeling from the apps themselves.",
];

const VAGUE_ANSWERS = [
  "Sorry, I am not fully sure what you mean. Are you asking about the app itself or my general university experience?",
  "Hmm, that is a bit broad for me. Could you narrow it down a little? Are you asking about a specific tool or just campus life in general?",
  "I am not totally sure how to answer that one. Do you mean a particular service, or just how things are going overall?",
];

const VAGUE_TRIGGERS = ["thoughts", "anything", "in general", "overall", "tell me about"];

function pick(list: string[], seed: number): string {
  return list[seed % list.length];
}

/**
 * Returns a mock participant answer for a researcher question.
 * - Utility-style questions get a practical answer.
 * - Emotional-style questions get a more reflective student answer.
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

export const SAMPLE_PERSONA: Omit<Persona, "id" | "createdAt"> = {
  name: "Aanya Patel",
  role: "First year international student",
  ageRange: "18 to 20",
  background:
    "Recently moved to Toronto, commutes to campus, uses UofT services like ACORN, Quercus, library tools, campus maps, and student events pages.",
  behaviours:
    "Uses digital tools only when needed, checks campus links before class, often searches information across multiple UofT websites.",
  goals:
    "Wants to feel more settled, find campus resources faster, and understand what is happening around campus.",
  frustrations:
    "Feels overwhelmed by scattered information, does not always feel connected to campus life, forgets to check university updates unless needed.",
  voiceStyle:
    "Natural, slightly hesitant, student like, practical, not overly polished.",
};

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
      "When the participant mentioned feeling like a visitor, you could have asked what would make them feel more settled.",
      "After a utility answer, you could have probed for a specific recent example.",
    ],
    suggestedImprovements: [
      "Instead of \"What do you think about the app?\" try \"Walk me through the last time you opened the app.\"",
      "Replace \"Do you like campus events?\" with \"Tell me about an event that made you feel part of campus.\"",
      "Follow vague answers with \"Can you give me a specific example from this week?\"",
    ],
    nextInterviewTips: [
      "Open with an easy, concrete warm-up question before going deeper.",
      "Pause after answers to invite the participant to keep going.",
      "Prefer \"how\" and \"tell me about\" over yes/no phrasing.",
    ],
  };
}
