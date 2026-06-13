"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileText, Loader2, TriangleAlert, X } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { PersonaForm, type PersonaDraft } from "@/components/PersonaForm";
import {
  QuestionGuideForm,
  countQuestions,
} from "@/components/QuestionGuideForm";
import { ResearchContextForm } from "@/components/ResearchContextForm";
import { StudyIntake, type ExtractedStudy } from "@/components/StudyIntake";
import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogPopup,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    description: "A project name is enough to move on.",
  },
  {
    label: "Participant",
    title: "Who are you interviewing?",
    description: "The richer the persona, the more believable the answers.",
  },
  {
    label: "Question guide",
    title: "What will you ask?",
    description: "Optional. Your questions stay visible during the interview.",
  },
] as const;

interface Prefill {
  source: string;
  llmAvailable: boolean;
}

interface MissingField {
  label: string;
  why: string;
  step: number;
}

// The fields that make a rehearsal feel real. Missing basics (project name,
// participant name) hard-block earlier; these only warrant a soft warning.
function getMissingFields(
  context: ResearchContext,
  persona: PersonaDraft,
  questionCount: number
): MissingField[] {
  const fields: MissingField[] = [];
  if (!context.researchGoal.trim()) {
    fields.push({
      label: "Research goal",
      why: "What this session is meant to uncover",
      step: 0,
    });
  }
  if (!persona.background.trim()) {
    fields.push({
      label: "Participant background",
      why: "Who they are and the situation they are in",
      step: 1,
    });
  }
  if (!persona.behaviours.trim()) {
    fields.push({
      label: "Behaviours",
      why: "How they act, so their replies stay in character",
      step: 1,
    });
  }
  if (!persona.goals.trim()) {
    fields.push({
      label: "Goals",
      why: "What they want, so they push back believably",
      step: 1,
    });
  }
  if (!persona.frustrations.trim()) {
    fields.push({
      label: "Frustrations",
      why: "What gets in their way, your richest source of insight",
      step: 1,
    });
  }
  if (questionCount === 0) {
    fields.push({
      label: "Question guide",
      why: "Your questions, to keep the session on track",
      step: 2,
    });
  }
  return fields;
}

export default function SetupPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"intro" | "wizard">("intro");
  const [context, setContext] = useState<ResearchContext>(EMPTY_CONTEXT);
  const [persona, setPersona] = useState<PersonaDraft>(EMPTY_PERSONA);
  const [questionsText, setQuestionsText] = useState("");
  const [step, setStep] = useState(0);
  const [maxVisited, setMaxVisited] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [prefill, setPrefill] = useState<Prefill | null>(null);
  const [warnOpen, setWarnOpen] = useState(false);
  const sampleRef = useRef<SampleStudy | null>(null);

  const goTo = (next: number) => {
    setStep(next);
    setMaxVisited((m) => Math.max(m, next));
    window.scrollTo({ top: 0 });
  };

  const startManual = () => {
    setPrefill(null);
    setPhase("wizard");
    setStep(0);
    setMaxVisited(0);
    window.scrollTo({ top: 0 });
  };

  const startFromDocument = (study: ExtractedStudy) => {
    setContext({
      ...study.context,
      questionGuide:
        study.questions.length > 0 ? study.questions : undefined,
    });
    setPersona(study.persona);
    setQuestionsText(study.questions.join("\n"));
    setPrefill({ source: study.source, llmAvailable: study.llmAvailable });
    setPhase("wizard");
    setStep(0);
    // Everything is prefilled, so let the reviewer jump to any step.
    setMaxVisited(STEP_META.length - 1);
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
  const missingFields = getMissingFields(context, persona, questionCount);

  const attemptStart = () => {
    if (isStarting) return;
    if (missingFields.length > 0) {
      setWarnOpen(true);
      return;
    }
    void handleStart();
  };

  const goToFirstMissing = () => {
    setWarnOpen(false);
    if (missingFields.length > 0) goTo(missingFields[0].step);
  };

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

  if (phase === "intro") {
    return (
      <>
        <AppHeader step="setup" />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
            <StudyIntake
              onManual={startManual}
              onExtracted={startFromDocument}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader step="setup" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
          {prefill ? (
            <div className="animate-rise mb-8 flex items-start gap-3 border border-foreground bg-wash-blue p-4">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-brand bg-background text-brand">
                <FileText className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight">
                  {prefill.llmAvailable
                    ? `Prefilled from ${prefill.source}`
                    : `Questions imported from ${prefill.source}`}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                  {prefill.llmAvailable
                    ? "Review each step and edit anything before you start."
                    : "AI extraction was unavailable, so we imported your questions only. Fill in the rest below."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPrefill(null)}
                aria-label="Dismiss"
                className="-m-1 shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          {/* Stepper */}
          <nav aria-label="Setup steps">
            <ol className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
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
                          "flex size-5 items-center justify-center text-[11px] font-semibold transition-colors duration-200",
                          isActive
                            ? "bg-foreground text-background"
                            : isDone
                              ? "bg-brand text-brand-foreground"
                              : "border border-input text-muted-foreground"
                        )}
                      >
                        {isDone ? (
                          <Check className="size-3" strokeWidth={3} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ol>
            {/* Progress */}
            <div className="mt-4 h-1 overflow-hidden bg-border" aria-hidden>
              <span
                className="block h-full bg-brand transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${((step + 1) / STEP_META.length) * 100}%` }}
              />
            </div>
          </nav>

          <header key={step} className="animate-rise mx-auto max-w-xl pt-10 pb-10 text-center">
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

          <div
            key={`panel-${step}`}
            className="border border-foreground bg-card p-6 sm:p-10"
          >
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
          </div>

          <div className="mt-10 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? setPhase("intro") : goTo(step - 1))}
            >
              {step === 0 ? "Back to start" : "Back"}
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
                  onClick={attemptStart}
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

      <AlertDialog open={warnOpen} onOpenChange={setWarnOpen}>
        <AlertDialogPopup>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center border border-foreground bg-wash-amber text-wash-amber-fg">
              <TriangleAlert className="size-4.5" />
            </span>
            <div className="min-w-0">
              <AlertDialogTitle>Start without a few key details?</AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5">
                These shape how real your participant feels. You can start
                anyway, but adding them makes the rehearsal sharper.
              </AlertDialogDescription>
            </div>
          </div>

          <ul className="mt-5 grid gap-3 border-t border-border pt-5">
            {missingFields.map((field) => (
              <li key={field.label} className="flex items-start gap-2.5">
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 bg-wash-amber-fg"
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium tracking-tight">
                    {field.label}
                  </p>
                  <p className="text-[12px] leading-snug text-muted-foreground">
                    {field.why}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              className="sm:order-1"
              disabled={isStarting}
              onClick={() => {
                setWarnOpen(false);
                void handleStart();
              }}
            >
              Start anyway
            </Button>
            <Button
              className="h-10 px-5 hover:bg-brand sm:order-2"
              onClick={goToFirstMissing}
            >
              Add them now
            </Button>
          </div>
        </AlertDialogPopup>
      </AlertDialog>
    </>
  );
}
