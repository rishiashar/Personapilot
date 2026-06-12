export type MessageRole = "researcher" | "participant";

export type SessionStatus = "active" | "completed";

export interface Persona {
  id: string;
  name: string;
  role: string;
  ageRange: string;
  background: string;
  behaviours: string;
  goals: string;
  frustrations: string;
  voiceStyle: string;
  /** Optional ElevenLabs voice id; falls back to the configured default. */
  voiceId?: string;
  voiceName?: string;
  voiceSelectionReason?: string;
  voiceSource?: "elevenlabs_search" | "default_fallback";
  createdAt: string;
}

export interface ResearchContext {
  projectName: string;
  researchGoal: string;
  productContext: string;
  targetAudience: string;
  keyLearningGoals: string;
  /** Optional interview script shown beside the interview room. */
  questionGuide?: string[];
}

export interface InterviewMessage {
  id: string;
  role: MessageRole;
  text: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  persona: Persona;
  researchContext: ResearchContext;
  messages: InterviewMessage[];
  status: SessionStatus;
  createdAt: string;
  endedAt?: string;
}

/** The kind of answer a question produced. */
export type AnswerKind = "story" | "factual" | "opinion" | "vague" | "yes_no";

/** How well the information an answer produced serves the research goal. */
export type GoalAlignment = "on_goal" | "partial" | "off_goal";

/** One question/answer pair mapped to what it actually got the researcher. */
export interface ExchangeInsight {
  question: string;
  answerKind: AnswerKind;
  whatYouLearned: string;
  alignment: GoalAlignment;
}

export interface SessionAnalysis {
  strongQuestions: string[];
  weakQuestions: string[];
  missedFollowUps: string[];
  suggestedImprovements: string[];
  nextInterviewTips: string[];
  /** Optional: absent on analyses saved before this field existed. */
  exchanges?: ExchangeInsight[];
}
