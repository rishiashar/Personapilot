"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { PersonaForm, type PersonaDraft } from "@/components/PersonaForm";
import {
  QuestionGuideForm,
  countQuestions,
} from "@/components/QuestionGuideForm";
import { ResearchContextForm } from "@/components/ResearchContextForm";
import { Button } from "@/components/ui/button";
import {
  savePersona,
  saveResearchContext,
  saveSession,
} from "@/lib/localStorage";
import { nextSampleStudy, type SampleStudy } from "@/lib/sampleStudies";
import type { InterviewSession, Persona, ResearchContext } from "@/lib/types";
import { cn, createId } from "@/lib/utils";

const EMPTY_CONTEXT: ResearchContext = {
  projectName: "",
  researchGoal: "",
  productContext: "",
  targetAudience: "",
  keyLearningGoals: "",
};

const EMPTY_PERSONA: PersonaDraft = {
  name: "",
  role: "",
  ageRange: "",
  background: "",
  behaviours: "",
  goals: "",
  frustrations: "",
  voiceStyle: "",
};

const STEP_META = [
  {
    label: "Research context",
    title: "What are you studying?",
    description:
      "The goal and product context shape how the participant answers. A project name is enough to move on.",
  },
  {
    label: "Participant",
    title: "Who are you interviewing?",
    description:
      "The richer the persona, the more believable the answers. Start with a name and add detail as you go.",
  },
  {
    label: "Question guide",
    title: "What will you ask?",
    description:
      "Optional. Type your questions or import them from a document; they stay visible during the interview.",
  },
] as const;

export default function SetupPage() {
  const router = useRouter();
  const [context, setContext] = useState<ResearchContext>(EMPTY_CONTEXT);
  const [persona, setPersona] = useState<PersonaDraft>(EMPTY_PERSONA);
  const [questionsText, setQuestionsText] = useState("");
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const sampleRef = useRef<SampleStudy | null>(null);

  const goTo = (next: number) => {
    setStep(next);
    setMaxVisited((m) => Math.max(m, next));
    window.scrollTo({ top: 0 });
  };

  const stepValid =
    step === 0
      ? context.projectName.trim().length > 0
      : step === 1
        ? persona.name.trim().length > 0
        : true;

  const canStart =
    persona.name.trim().length > 0 && context.projectName.trim().length > 0;

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);

    const questionGuide = questionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const fullContext: ResearchContext = {
      ...context,
      questionGuide: questionGuide.length > 0 ? questionGuide : undefined,
    };

    const fullPersona: Persona = {
      ...persona,
      id: createId("persona"),
      createdAt: new Date().toISOString(),
    };

    // Auto-select a voice for the persona (non-blocking: falls back on failure).
    try {
      const res = await fetch("/api/select-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: fullPersona,
          researchContext: fullContext,
        }),
      });
      if (res.ok) {
        const voice = (await res.json()) as {
          voiceId?: string;
          voiceName?: string;
          voiceSelectionReason?: string;
          voiceSource?: string;
        };
        if (voice.voiceId) {
          fullPersona.voiceId = voice.voiceId;
          fullPersona.voiceName = voice.voiceName;
          fullPersona.voiceSelectionReason = voice.voiceSelectionReason;
          fullPersona.voiceSource =
            (voice.voiceSource as Persona["voiceSource"]) ?? "elevenlabs_search";
        }
      }
    } catch {
      // Voice selection is best-effort; continue without it.
    }

    const session: InterviewSession = {
      id: createId("session"),
      persona: fullPersona,
      researchContext: fullContext,
      messages: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    savePersona(fullPersona);
    saveResearchContext(fullContext);
    saveSession(session);
    router.push("/interview");
  };

  const questionCount = countQuestions(questionsText);
  const meta = STEP_META[step];

  const hint =
    step === 0 && !stepValid
      ? "Add a project name to continue."
      : step === 1 && !stepValid
        ? "Add a persona name to continue."
        : step === 2
          ? questionCount > 0
            ? `${questionCount} ${questionCount === 1 ? "question" : "questions"} ready.`
            : "Questions are optional. You can start without them."
          : "";

  return (
    <>
      <AppHeader step="setup" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
          {/* Stepper */}
          <nav aria-label="Setup steps">
            <ol className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {STEP_META.map((item, index) => {
                const isActive = index === step;
                const isDone = index < step;
                const reachable = index <= maxVisited;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      disabled={!reachable}
                      onClick={() => reachable && goTo(index)}
                      aria-current={isActive ? "step" : undefined}
                      className={cn(
                        "flex items-center gap-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "text-foreground"
                          : reachable
                            ? "text-muted-foreground hover:text-foreground"
                            : "text-muted-foreground/50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 items-center justify-center text-[11px] font-semibold",
                          isActive
                            ? "bg-foreground text-background"
                            : isDone
                              ? "bg-brand text-brand-foreground"
                              : "border border-input text-muted-foreground"
                        )}
                      >
                        {index + 1}
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Progress */}
            <div className="mt-4 flex gap-1" aria-hidden>
              {STEP_META.map((item, index) => (
                <span
                  key={item.label}
                  className={cn(
                    "h-0.5 flex-1",
                    index <= step ? "bg-brand" : "bg-border"
                  )}
                />
              ))}
            </div>
          </nav>

          <header className="max-w-xl pt-10 pb-10">
            <p className="caps text-muted-foreground">
              Step {step + 1} of {STEP_META.length}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-[2.6rem]">
              {meta.title}
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {meta.description}
            </p>
          </header>

          {step === 0 && (
            <ResearchContextForm
              value={context}
              onChange={setContext}
              onUseSample={() => {
                const study = nextSampleStudy();
                sampleRef.current = study;
                setContext(study.context);
                setQuestionsText((study.context.questionGuide ?? []).join("\n"));
              }}
            />
          )}
          {step === 1 && (
            <PersonaForm
              value={persona}
              onChange={setPersona}
              onUseSample={() => {
                // Pair the persona with the sampled context when one is in
                // play; repeated clicks cycle to the next study's persona.
                const current = sampleRef.current;
                const study =
                  current && persona.name !== current.persona.name
                    ? current
                    : nextSampleStudy();
                sampleRef.current = study;
                setPersona(study.persona);
              }}
            />
          )}
          {step === 2 && (
            <QuestionGuideForm
              value={questionsText}
              onChange={setQuestionsText}
            />
          )}

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-foreground pt-7">
            <Button
              variant="ghost"
              onClick={() => goTo(step - 1)}
              className={cn(step === 0 && "invisible")}
            >
              Back
            </Button>
            <div className="flex items-center gap-4">
              <p className="hidden text-sm text-muted-foreground sm:block">
                {hint}
              </p>
              {step < STEP_META.length - 1 ? (
                <Button
                  className="h-11 px-7 hover:bg-brand"
                  disabled={!stepValid}
                  onClick={() => goTo(step + 1)}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  className="h-11 px-7 text-[15px] hover:bg-brand"
                  onClick={handleStart}
                  disabled={!canStart || isStarting}
                >
                  {isStarting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Selecting voice…
                    </>
                  ) : (
                    "Start interview session"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </>
  );
}
