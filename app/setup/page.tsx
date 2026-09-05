"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RiAlertLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckLine,
  RiFileTextLine,
  RiLoader4Line,
} from "@remixicon/react";

import { Announcement } from "@/components/base/announcement/announcement";
import { Button } from "@/components/base/buttons/button";
import {
  Dialog,
  DialogDescription,
  DialogTitle,
} from "@/components/base/dialog/dialog";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow } from "@/components/Eyebrow";
import { PersonaForm, type PersonaDraft } from "@/components/PersonaForm";
import {
  QuestionGuideForm,
  countQuestions,
} from "@/components/QuestionGuideForm";
import { ResearchContextForm } from "@/components/ResearchContextForm";
import { StudyIntake, type ExtractedStudy } from "@/components/StudyIntake";
import {
  savePersona,
  saveResearchContext,
  saveSession,
} from "@/lib/localStorage";
import { nextSampleStudy, type SampleStudy } from "@/lib/sampleStudies";
import type { InterviewSession, Persona, ResearchContext } from "@/lib/types";
import { createId } from "@/lib/utils";
import { cx } from "@/utils/cx";

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
  questionCount: number,
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

function Stepper({
  step,
  maxVisited,
  onGoTo,
}: {
  step: number;
  maxVisited: number;
  onGoTo: (index: number) => void;
}) {
  return (
    <nav aria-label="Setup steps" className="flex flex-col items-center gap-4">
      <ol className="inline-flex flex-wrap items-center justify-center gap-1 rounded-full bg-background-secondary-default p-1">
        {STEP_META.map((item, index) => {
          const isActive = index === step;
          const isDone = index < step;
          const reachable = index <= maxVisited;
          return (
            <li key={item.label}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => reachable && onGoTo(index)}
                aria-current={isActive ? "step" : undefined}
                className={cx(
                  "flex items-center gap-2 rounded-full py-1.5 pr-3.5 pl-2 text-body-2-medium transition-colors duration-150",
                  "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  isActive
                    ? "bg-background-primary-default text-text-primary shadow-2xs"
                    : reachable
                      ? "cursor-pointer text-text-secondary hover:text-text-primary"
                      : "cursor-not-allowed text-text-tertiary",
                )}
              >
                <span
                  className={cx(
                    "flex size-5 items-center justify-center rounded-full text-caption-2-semibold tracking-normal transition-colors duration-150",
                    isActive && "bg-accent-500 text-text-white",
                    isDone && "bg-accent-100 text-accent-700",
                    !isActive && !isDone && "bg-background-tertiary-default text-text-tertiary",
                  )}
                >
                  {isDone ? <RiCheckLine className="size-3" aria-hidden /> : index + 1}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ol>
      <div
        className="h-1 w-full max-w-md overflow-hidden rounded-full bg-background-tertiary-default"
        aria-hidden
      >
        <span
          className="block h-full rounded-full bg-accent-500 transition-[width] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{ width: `${((step + 1) / STEP_META.length) * 100}%` }}
        />
      </div>
    </nav>
  );
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
            <div className="animate-rise mb-8">
              <Announcement
                icon={RiFileTextLine}
                title={
                  prefill.llmAvailable
                    ? `Prefilled from ${prefill.source}`
                    : `Questions imported from ${prefill.source}`
                }
                description={
                  prefill.llmAvailable
                    ? "Review each step and edit anything before you start."
                    : "AI extraction was unavailable, so we imported your questions only. Fill in the rest below."
                }
                dismissible
                onClose={() => setPrefill(null)}
              />
            </div>
          ) : null}

          <Stepper step={step} maxVisited={maxVisited} onGoTo={goTo} />

          <header key={step} className="animate-rise mx-auto max-w-xl pt-10 pb-10 text-center">
            <Eyebrow>
              Step {step + 1} of {STEP_META.length}
            </Eyebrow>
            <h1 className="mt-3 text-display-4-semibold text-balance text-text-primary sm:text-display-3-semibold">
              {meta.title}
            </h1>
            <p className="mt-4 text-headline-regular text-text-secondary">
              {meta.description}
            </p>
          </header>

          <div
            key={`panel-${step}`}
            className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-10"
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

          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              leadingIcon={RiArrowLeftLine}
              onClick={() => (step === 0 ? setPhase("intro") : goTo(step - 1))}
            >
              {step === 0 ? "Back to start" : "Back"}
            </Button>
            <div className="flex items-center gap-4">
              <p className="hidden text-body-2-regular text-text-secondary sm:block">
                {hint}
              </p>
              {step < STEP_META.length - 1 ? (
                <Button
                  trailingIcon={RiArrowRightLine}
                  disabled={!stepValid}
                  onClick={() => goTo(step + 1)}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={attemptStart}
                  disabled={!canStart || isStarting}
                  leadingIcon={isStarting ? SpinnerIcon : undefined}
                >
                  {isStarting ? "Selecting voice" : "Start interview session"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog
        role="alertdialog"
        isOpen={warnOpen}
        onOpenChange={setWarnOpen}
        aria-label="Start without a few key details?"
      >
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2lg bg-wash-amber text-wash-amber-fg">
            <RiAlertLine className="size-4.5" aria-hidden />
          </span>
          <div className="min-w-0">
            <DialogTitle>Start without a few key details?</DialogTitle>
            <DialogDescription className="mt-1.5">
              These shape how real your participant feels. You can start
              anyway, but adding them makes the rehearsal sharper.
            </DialogDescription>
          </div>
        </div>

        <ul className="mt-5 grid gap-3 border-t border-separator-border pt-5">
          {missingFields.map((field) => (
            <li key={field.label} className="flex items-start gap-2.5">
              <span
                aria-hidden
                className="mt-[7px] size-1.5 shrink-0 rounded-full bg-wash-amber-fg"
              />
              <div className="min-w-0">
                <p className="text-body-2-medium text-text-primary">{field.label}</p>
                <p className="text-caption-1-medium text-text-secondary">{field.why}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            disabled={isStarting}
            onClick={() => {
              setWarnOpen(false);
              void handleStart();
            }}
          >
            Start anyway
          </Button>
          <Button onClick={goToFirstMissing}>Add them now</Button>
        </div>
      </Dialog>
    </>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return <RiLoader4Line className={cx(className, "animate-spin")} aria-hidden />;
}
