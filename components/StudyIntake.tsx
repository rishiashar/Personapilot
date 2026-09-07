"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiEditLine,
  RiFileUploadLine,
  RiFocus3Line,
  RiListCheck2,
  RiSparklingLine,
  RiUploadCloud2Line,
  RiUserLine,
} from "@remixicon/react";

import { AgentThinking } from "@/components/application/agent-thinking/agent-thinking";
import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import { LinkButton } from "@/components/base/buttons/link-button";
import { Divider } from "@/components/base/divider/divider";
import { TextArea } from "@/components/base/input/textarea";
import { Eyebrow } from "@/components/Eyebrow";
import type { PersonaDraft } from "@/components/PersonaForm";
import type { ResearchContext } from "@/lib/types";
import { cx } from "@/utils/cx";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

const EXTRACT_PREVIEW = [
  {
    label: "Research context",
    hint: "Goal, product, and who you are studying",
    tone: "bg-wash-blue text-wash-blue-fg",
    icon: RiFocus3Line,
  },
  {
    label: "Participant persona",
    hint: "Background, goals, frustrations, and voice",
    tone: "bg-wash-amber text-wash-amber-fg",
    icon: RiUserLine,
  },
  {
    label: "Question guide",
    hint: "Your discussion questions, in order",
    tone: "bg-wash-green text-wash-green-fg",
    icon: RiListCheck2,
  },
] as const;

export interface ExtractedStudy {
  context: ResearchContext;
  persona: PersonaDraft;
  questions: string[];
  /** False when no AI key was configured: only questions could be detected. */
  llmAvailable: boolean;
  /** Where the study came from, for the review banner. */
  source: string;
}

interface ApiResult {
  context?: Partial<ResearchContext>;
  persona?: Partial<PersonaDraft>;
  questions?: string[];
  llmAvailable?: boolean;
  error?: string;
}

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

function normalize(data: ApiResult, source: string): ExtractedStudy {
  return {
    context: { ...EMPTY_CONTEXT, ...data.context },
    persona: { ...EMPTY_PERSONA, ...data.persona },
    questions: Array.isArray(data.questions) ? data.questions : [],
    llmAvailable: data.llmAvailable !== false,
    source,
  };
}

export function StudyIntake({
  onManual,
  onExtracted,
}: {
  onManual: () => void;
  onExtracted: (study: ExtractedStudy) => void;
}) {
  const [view, setView] = useState<"choose" | "document">("choose");

  if (view === "choose") {
    return <IntakeChooser onManual={onManual} onDocument={() => setView("document")} />;
  }

  return (
    <DocumentIntake onBack={() => setView("choose")} onExtracted={onExtracted} />
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <header className={cx("text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-3 text-display-4-semibold text-balance text-text-primary sm:text-display-3-semibold">
        {title}
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-headline-regular text-text-secondary">
        {description}
      </p>
    </header>
  );
}

function IntakeChooser({
  onManual,
  onDocument,
}: {
  onManual: () => void;
  onDocument: () => void;
}) {
  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <PageHeader
        eyebrow="New study"
        title="How do you want to start?"
        description="Bring a research brief and we will fill everything in, or set it up step by step."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <ChoiceCard
          icon={RiFileUploadLine}
          tag="Fastest"
          title="Start from a document"
          description="Upload a brief or discussion guide. We read it and fill in your context, participant, and questions."
          cta="Upload a document"
          onClick={onDocument}
        />
        <ChoiceCard
          icon={RiEditLine}
          title="Set up manually"
          description="Fill in your research context, participant, and question guide one step at a time."
          cta="Start from scratch"
          onClick={onManual}
        />
      </div>
    </div>
  );
}

function ChoiceCard({
  icon: Icon,
  tag,
  title,
  description,
  cta,
  onClick,
}: {
  icon: typeof RiEditLine;
  tag?: string;
  title: string;
  description: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group flex cursor-pointer flex-col gap-5 rounded-3xl border border-border-button-default bg-background-primary-default p-6 text-left",
        "transition-[background-color,border-color,box-shadow] duration-150 ease",
        "hover:border-border-button-hover hover:bg-background-primary-hover hover:shadow-card",
        "active:bg-background-primary-active",
        "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center rounded-2lg bg-accent-50 text-accent-600">
          <Icon className="size-5" aria-hidden />
        </span>
        {tag ? (
          <Chip variant="caption" color="blue">
            {tag}
          </Chip>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <h2 className="text-title-3-semibold text-text-primary">{title}</h2>
        <p className="text-body-regular text-text-secondary">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1 text-body-medium text-accent-600">
        {cta}
        <RiArrowRightLine
          className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </button>
  );
}

function DocumentIntake({
  onBack,
  onExtracted,
}: {
  onBack: () => void;
  onExtracted: (study: ExtractedStudy) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasted, setPasted] = useState("");

  const extract = async (init: RequestInit, source: string) => {
    setIsReading(true);
    setError(null);
    try {
      const res = await fetch("/api/extract-study", init);
      const data = (await res.json()) as ApiResult;
      if (!res.ok) {
        setError(data.error ?? "Could not read that document.");
        return;
      }
      onExtracted(normalize(data, source));
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setIsReading(false);
    }
  };

  const handleFile = (file: File) => {
    const name = file.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setError("That file type is not supported. Use PDF, Word, text, or Markdown.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    void extract({ method: "POST", body: form }, file.name);
  };

  const handlePaste = () => {
    if (pasted.trim().length < 20) return;
    void extract(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasted }),
      },
      "Pasted text",
    );
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (isReading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="animate-rise mx-auto max-w-4xl">
      <PageHeader
        eyebrow="From a document"
        title="Bring your study"
        description="Drop in a research brief or discussion guide. We read it and fill in your study for you to review."
      />

      <div className="mt-10 overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default shadow-lg">
        {isReading ? (
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center"
          >
            <AgentThinking variant="infinity" tone="accent" label="Reading your brief" />
            <div>
              <p className="text-headline-medium text-text-primary">
                Filling in your study
              </p>
              <p className="mt-1 text-body-2-regular text-text-secondary">
                Pulling out your context, participant, and questions. This takes
                a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-6 p-6 sm:p-8">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragEnter={onDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                aria-label="Upload a research document"
                className={cx(
                  "group/drop flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-11 text-center transition-colors duration-150",
                  "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  isDragging
                    ? "border-accent-500 bg-accent-50"
                    : "border-border-button-default bg-background-secondary-default hover:border-border-button-hover",
                )}
              >
                <span
                  className={cx(
                    "flex size-12 items-center justify-center rounded-full transition-colors duration-150",
                    isDragging
                      ? "bg-accent-500 text-text-white"
                      : "bg-file-upload-icon-background text-file-upload-icon-foreground group-hover/drop:text-file-upload-icon-foreground-hover",
                  )}
                >
                  <RiUploadCloud2Line className="size-6" aria-hidden />
                </span>
                <span className="text-headline-medium text-text-primary">
                  {isDragging ? "Drop it here" : "Drag and drop your document"}
                </span>
                <span className="text-body-2-regular text-text-secondary">
                  or{" "}
                  <span className="text-body-2-medium text-text-primary underline underline-offset-2">
                    browse files
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  {["PDF", "DOCX", "TXT", "MD"].map((ext) => (
                    <Chip key={ext} variant="caption" color="soft">
                      {ext}
                    </Chip>
                  ))}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                className="sr-only"
                aria-label="Upload a research document"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                  e.target.value = "";
                }}
              />

              <Divider>or paste it</Divider>

              <div className="grid gap-3">
                <TextArea
                  rows={4}
                  fieldClassName="min-h-28 resize-none"
                  placeholder="Paste your research brief, study plan, or discussion guide here."
                  value={pasted}
                  onChange={setPasted}
                  aria-label="Paste your research brief"
                />
                <div className="flex justify-end">
                  <Button
                    leadingIcon={RiSparklingLine}
                    disabled={pasted.trim().length < 20}
                    onClick={handlePaste}
                  >
                    Extract study
                  </Button>
                </div>
              </div>

              {error ? (
                <p role="status" className="text-body-2-medium text-text-error-primary">
                  {error}
                </p>
              ) : null}
            </div>

            <aside className="flex flex-col gap-6 border-separator-border bg-background-secondary-default p-7 max-lg:border-t sm:p-8 lg:border-l">
              <Eyebrow>What we pull out</Eyebrow>
              <ul className="grid gap-5">
                {EXTRACT_PREVIEW.map(({ label, hint, tone, icon: Icon }) => (
                  <li key={label} className="flex items-start gap-3">
                    <span
                      className={cx(
                        "flex size-9 shrink-0 items-center justify-center rounded-2lg",
                        tone,
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-medium text-text-primary">{label}</p>
                      <p className="text-body-2-regular text-text-secondary">{hint}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-separator-border pt-4 text-body-2-regular text-text-secondary">
                Anything the document does not mention stays blank. You review
                and edit every field before the session starts.
              </p>
            </aside>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center">
        <LinkButton
          variant="secondary"
          leadingIcon={RiArrowLeftLine}
          onClick={onBack}
          disabled={isReading}
        >
          Back to start
        </LinkButton>
      </div>
    </div>
  );
}
