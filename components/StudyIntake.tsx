"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  ArrowRight,
  FileUp,
  ListChecks,
  Loader2,
  PenLine,
  Sparkles,
  Target,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PersonaDraft } from "@/components/PersonaForm";
import type { ResearchContext } from "@/lib/types";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

const EXTRACT_PREVIEW = [
  {
    label: "Research context",
    hint: "Goal, product, and who you are studying",
    tone: "bg-wash-blue text-wash-blue-fg",
    icon: <Target className="size-4" />,
  },
  {
    label: "Participant persona",
    hint: "Background, goals, frustrations, and voice",
    tone: "bg-wash-amber text-wash-amber-fg",
    icon: <UserRound className="size-4" />,
  },
  {
    label: "Question guide",
    hint: "Your discussion questions, in order",
    tone: "bg-wash-green text-wash-green-fg",
    icon: <ListChecks className="size-4" />,
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

function IntakeChooser({
  onManual,
  onDocument,
}: {
  onManual: () => void;
  onDocument: () => void;
}) {
  return (
    <div className="animate-rise mx-auto max-w-2xl">
      <header className="text-center">
        <p className="caps text-muted-foreground">New study</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-[2.6rem]">
          How do you want to start?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Bring a research brief and we will fill everything in, or set it up
          step by step.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <ChoiceCard
          icon={<FileUp className="size-5" />}
          tag="Fastest"
          title="Start from a document"
          description="Upload a brief or discussion guide. We read it and fill in your context, participant, and questions."
          cta="Upload a document"
          onClick={onDocument}
        />
        <ChoiceCard
          icon={<PenLine className="size-5" />}
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
  icon,
  tag,
  title,
  description,
  cta,
  onClick,
}: {
  icon: React.ReactNode;
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
      className="group flex flex-col gap-5 border border-foreground bg-card p-7 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex items-start justify-between">
        <span className="flex size-11 items-center justify-center border border-foreground bg-background transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
          {icon}
        </span>
        {tag ? (
          <span className="caps border border-brand bg-wash-blue px-2 py-1 text-brand">
            {tag}
          </span>
        ) : null}
      </div>
      <div className="grid gap-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
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
      "Pasted text"
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
      <header className="text-center">
        <p className="caps text-muted-foreground">From a document</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-[2.6rem]">
          Bring your study
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Drop in a research brief or discussion guide. We read it and fill in
          your study for you to review.
        </p>
      </header>

      <div className="mt-10 border border-foreground bg-card shadow-[8px_8px_0_0_var(--foreground)]">
        {isReading ? (
          <div
            role="status"
            className="flex flex-col items-center justify-center gap-5 px-6 py-24 text-center"
          >
            <span className="relative flex size-14 items-center justify-center border border-foreground bg-background">
              <span
                aria-hidden
                className="absolute inset-0 animate-pulse bg-wash-blue"
              />
              <Loader2 className="relative size-6 animate-spin text-brand" />
            </span>
            <div>
              <p className="text-[15px] font-semibold tracking-tight">
                Reading your brief and filling in your study
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Pulling out your context, participant, and questions. This takes
                a few seconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[1.4fr_1fr]">
            {/* Action side */}
            <div className="grid gap-6 p-6 sm:p-8">
              {/* Upload zone */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                onDragEnter={onDragEnter}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                aria-label="Upload a research document"
                className={cn(
                  "group/drop flex w-full cursor-pointer flex-col items-center justify-center gap-3.5 border-2 border-dashed px-6 py-11 text-center transition-colors",
                  isDragging
                    ? "border-brand bg-wash-blue"
                    : "border-input bg-gradient-to-br from-wash-blue/40 via-card to-card hover:border-foreground hover:from-wash-blue/70"
                )}
              >
                <span
                  className={cn(
                    "flex size-12 items-center justify-center border border-foreground transition-colors",
                    isDragging
                      ? "bg-brand text-brand-foreground"
                      : "bg-background group-hover/drop:bg-brand group-hover/drop:text-brand-foreground"
                  )}
                >
                  <Upload className="size-5" />
                </span>
                <span className="text-[15px] font-semibold tracking-tight">
                  {isDragging
                    ? "Drop it here"
                    : "Drag and drop your document"}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  or{" "}
                  <span className="font-medium text-foreground underline underline-offset-2">
                    browse files
                  </span>
                </span>
                <span className="mt-1 flex flex-wrap items-center justify-center gap-1.5">
                  {["PDF", "DOCX", "TXT", "MD"].map((ext) => (
                    <span
                      key={ext}
                      className="caps border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {ext}
                    </span>
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

              {/* Divider */}
              <div className="flex items-center gap-3" aria-hidden>
                <span className="h-px flex-1 bg-border" />
                <span className="caps text-muted-foreground">or paste it</span>
                <span className="h-px flex-1 bg-border" />
              </div>

              {/* Paste */}
              <div className="grid gap-3">
                <Textarea
                  rows={4}
                  className="min-h-28 resize-none"
                  placeholder="Paste your research brief, study plan, or discussion guide here."
                  value={pasted}
                  onChange={(e) => setPasted(e.target.value)}
                  aria-label="Paste your research brief"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    className="h-10 px-5 hover:bg-brand"
                    disabled={pasted.trim().length < 20}
                    onClick={handlePaste}
                  >
                    <Sparkles className="size-4" />
                    Extract study
                  </Button>
                </div>
              </div>

              {error ? (
                <p role="status" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
            </div>

            {/* Preview side */}
            <aside className="relative flex flex-col gap-6 border-foreground bg-gradient-to-br from-wash-blue via-background to-background p-7 max-lg:border-t lg:border-l sm:p-8">
              <p className="caps text-muted-foreground">What we pull out</p>
              <ul className="grid gap-5">
                {EXTRACT_PREVIEW.map((item) => (
                  <li key={item.label} className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center border border-foreground",
                        item.tone
                      )}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold tracking-tight">
                        {item.label}
                      </p>
                      <p className="text-[13px] leading-snug text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-auto border-t border-border/70 pt-4 text-[13px] leading-relaxed text-muted-foreground">
                Anything the document does not mention stays blank. You review
                and edit every field before the session starts.
              </p>
            </aside>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center">
        <Button variant="ghost" onClick={onBack} disabled={isReading}>
          Back to start
        </Button>
      </div>
    </div>
  );
}
