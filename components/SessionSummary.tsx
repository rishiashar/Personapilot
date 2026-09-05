"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Key } from "react-aria-components";
import {
  RiChat3Line,
  RiLoader4Line,
  RiQuestionAnswerLine,
  RiRefreshLine,
  RiSparklingLine,
  RiThumbUpLine,
} from "@remixicon/react";

import { Chip } from "@/components/base/badges/chip";
import { Button } from "@/components/base/buttons/button";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/base/table/table";
import { Tab, TabList, TabPanel, Tabs } from "@/components/base/tabs/tabs";
import { Eyebrow } from "@/components/Eyebrow";
import { NavButton } from "@/components/NavButton";
import { ParticipantCard } from "@/components/ParticipantCard";
import { Reveal, useReducedMotion } from "@/components/landing/Reveal";
import { Tag, type TagTone } from "@/components/Tag";
import { buildSessionAnalysis } from "@/lib/mockResponses";
import { getSessionAnalysis, saveSessionAnalysis } from "@/lib/localStorage";
import type {
  AnswerKind,
  ExchangeInsight,
  GoalAlignment,
  InterviewSession,
  SessionAnalysis,
} from "@/lib/types";
import { cx } from "@/utils/cx";

type IconComponent = typeof RiChat3Line;

// Counts a number up to its target the first time it mounts, and again from the
// old value to the new one whenever the analysis changes, so the result stats
// read as freshly computed. Jumps straight to the value under reduced motion.
function useCountFrom(target: number, durationMs = 600): number {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    let raf = 0;
    if (reducedMotion || from === target) {
      raf = requestAnimationFrame(() => {
        setDisplay(target);
        fromRef.current = target;
      });
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs, reducedMotion]);

  return display;
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
  label: string;
  value: number;
}) {
  const display = useCountFrom(value);
  return (
    <div className="flex min-w-0 flex-col justify-between gap-4 p-5">
      <span className="flex w-fit items-center rounded-md bg-background-secondary-default p-1.5">
        <Icon className="size-5 shrink-0 text-foreground-icon-primary" aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5">
        <dd className="font-mono text-title-1-medium text-text-primary tabular-nums">
          {display}
        </dd>
        <dt className="text-body-2-medium text-text-secondary">{label}</dt>
      </div>
    </div>
  );
}

type Verdict = {
  label: string;
  takeaway: string;
  wash: string;
};

// One glanceable judgement derived from the balance of coaching feedback:
// what went well (strong questions) versus what needs attention (weak
// questions and missed follow-ups).
function getVerdict(analysis: SessionAnalysis): Verdict {
  const good = analysis.strongQuestions.length;
  const bad = analysis.weakQuestions.length + analysis.missedFollowUps.length;

  if (good > 0 && good >= bad) {
    return {
      label: "Strong session",
      takeaway:
        "Your questioning carried this interview. Skim the follow-ups below to sharpen the edges.",
      wash: "bg-wash-green text-wash-green-fg",
    };
  }
  if (good > 0) {
    return {
      label: "Mixed session",
      takeaway:
        "Some questions landed, but missed follow-ups and weak phrasing left insights on the table.",
      wash: "bg-wash-amber text-wash-amber-fg",
    };
  }
  return {
    label: "Needs work",
    takeaway:
      "This one was rough. Start with the suggested improvements, then rerun the rehearsal.",
    wash: "bg-wash-red text-wash-red-fg",
  };
}

type SectionKey =
  | "strongQuestions"
  | "weakQuestions"
  | "missedFollowUps"
  | "suggestedImprovements"
  | "nextInterviewTips";

const SECTIONS: {
  key: SectionKey;
  label: string;
  short: string;
  tone: TagTone;
  bar: string;
  accent?: boolean;
}[] = [
  {
    key: "strongQuestions",
    label: "Strong questions",
    short: "Strong",
    tone: "green",
    bar: "bg-wash-green-fg",
  },
  {
    key: "weakQuestions",
    label: "Weak questions",
    short: "Needs work",
    tone: "yellow",
    bar: "bg-wash-amber-fg",
  },
  {
    key: "missedFollowUps",
    label: "Missed follow-ups",
    short: "Missed",
    tone: "red",
    bar: "bg-wash-red-fg",
  },
  {
    key: "suggestedImprovements",
    label: "Suggested improvements",
    short: "Rewrites",
    tone: "blue",
    bar: "bg-wash-blue-fg",
    accent: true,
  },
  {
    key: "nextInterviewTips",
    label: "Next interview tips",
    short: "Next time",
    tone: "neutral",
    bar: "bg-chart-neutral",
  },
];

const CHIP_COLOR: Record<TagTone, "lime" | "yellow" | "rose" | "blue" | "soft" | "gray"> = {
  green: "lime",
  yellow: "yellow",
  red: "rose",
  blue: "blue",
  neutral: "soft",
  ink: "gray",
};

// Glanceable breakdown: a proportional bar of the feedback mix plus chips that
// jump to each section's tab.
function GlanceBar({
  analysis,
  onSelect,
}: {
  analysis: SessionAnalysis;
  onSelect: (key: SectionKey) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [grown, setGrown] = useState(false);
  const counts = SECTIONS.filter((s) => s.key !== "nextInterviewTips").map((s) => ({
    ...s,
    count: analysis[s.key].length,
  }));
  const total = counts.reduce((sum, s) => sum + s.count, 0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (total === 0) return null;

  const filled = grown || reducedMotion;

  return (
    <div>
      <div
        className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-background-primary-default/60"
        aria-hidden
      >
        {counts.map((s) =>
          s.count > 0 ? (
            <span
              key={s.key}
              className={cx(
                s.bar,
                "rounded-full",
                !reducedMotion &&
                  "transition-[width] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
              style={{ width: filled ? `${(s.count / total) * 100}%` : "0%" }}
            />
          ) : null,
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {counts.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => onSelect(s.key)}
            className="cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <Chip variant="caption" color={CHIP_COLOR[s.tone]} className="gap-1.5">
              {s.short}
              <span className="font-mono tabular-nums">{s.count}</span>
            </Chip>
          </button>
        ))}
      </div>
    </div>
  );
}

const ANSWER_KIND_LABEL: Record<AnswerKind, { label: string; tone: TagTone }> =
  {
    story: { label: "Concrete story", tone: "green" },
    factual: { label: "Factual detail", tone: "blue" },
    opinion: { label: "Opinion", tone: "neutral" },
    vague: { label: "Vague answer", tone: "yellow" },
    yes_no: { label: "Yes or no", tone: "red" },
  };

const ALIGNMENT_LABEL: Record<GoalAlignment, { label: string; tone: TagTone }> =
  {
    on_goal: { label: "On goal", tone: "green" },
    partial: { label: "Partial", tone: "yellow" },
    off_goal: { label: "Off goal", tone: "red" },
  };

// The core loop of the tool: question in, answer type out. Shows whether each
// question is actually producing the information the study is after.
function ExchangeBreakdown({ exchanges }: { exchanges: ExchangeInsight[] }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default">
      <div className="flex flex-wrap items-baseline justify-between gap-2 px-5 pt-5 pb-4">
        <h2 className="text-title-2-medium text-text-primary">Question by question</h2>
        <p className="text-body-2-regular text-text-secondary">
          What each question got you, and whether it serves your goal.
        </p>
      </div>
      <Table aria-label="Question by question breakdown" size="sm">
        <TableHeader>
          <TableColumn id="index" className="w-10">
            #
          </TableColumn>
          <TableColumn id="question" isRowHeader className="min-w-[16rem]">
            Question
          </TableColumn>
          <TableColumn id="kind">Answer type</TableColumn>
          <TableColumn id="alignment">Goal fit</TableColumn>
          <TableColumn id="learned" className="min-w-[16rem]">
            What you learned
          </TableColumn>
        </TableHeader>
        <TableBody>
          {exchanges.map((exchange, index) => {
            const kind = ANSWER_KIND_LABEL[exchange.answerKind];
            const alignment = ALIGNMENT_LABEL[exchange.alignment];
            return (
              <TableRow key={index} id={index}>
                <TableCell>
                  <span className="font-mono text-caption-1-medium text-text-tertiary tabular-nums">
                    {index + 1}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-body-2-medium whitespace-normal text-text-primary">
                    {exchange.question}
                  </span>
                </TableCell>
                <TableCell>
                  <Tag tone={kind.tone}>{kind.label}</Tag>
                </TableCell>
                <TableCell>
                  <Tag tone={alignment.tone}>{alignment.label}</Tag>
                </TableCell>
                <TableCell>
                  <span className="text-body-2-regular whitespace-normal text-text-secondary">
                    {exchange.whatYouLearned}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}

function FeedbackList({ items, accent }: { items: string[]; accent?: boolean }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-body-regular text-text-secondary">
        Nothing flagged here for this session.
      </p>
    );
  }
  return (
    <ol className="divide-y divide-separator-border">
      {items.map((item, index) => (
        <li
          key={index}
          className={cx(
            "grid grid-cols-[28px_minmax(0,1fr)] gap-2 py-3.5",
            accent && "border-l-2 border-accent-500 pl-3",
          )}
        >
          <span className="pt-0.5 font-mono text-caption-1-medium text-text-tertiary tabular-nums">
            {index + 1}
          </span>
          <span className="text-body-regular text-text-primary">{item}</span>
        </li>
      ))}
    </ol>
  );
}

export function SessionSummary({ session }: { session: InterviewSession }) {
  // Placeholder analysis is always available and shown first.
  const placeholder = useMemo(() => buildSessionAnalysis(session), [session]);

  // Restore a previously generated analysis only if it was produced from this
  // exact session AND the same transcript length; otherwise it is stale and a
  // fresh one is generated below. Reads localStorage once on mount (this
  // component only renders after the store has hydrated).
  const saved = useMemo(
    () => getSessionAnalysis(session.id, session.messages.length),
    [session.id, session.messages.length],
  );
  const [analysis, setAnalysis] = useState<SessionAnalysis>(
    saved ?? placeholder,
  );
  const [isAiGenerated, setIsAiGenerated] = useState(saved !== null);

  // A finished interview with no fresh saved analysis is analyzed on arrival;
  // starting in the analyzing state means the first paint already shows it.
  const shouldAutoRun =
    session.status === "completed" &&
    session.messages.length > 0 &&
    saved === null;
  const [isAnalyzing, setIsAnalyzing] = useState(shouldAutoRun);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Key>("strongQuestions");
  const sectionsRef = useRef<HTMLDivElement>(null);

  const runAnalysis = useCallback(async () => {
    try {
      const res = await fetch("/api/session-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: session.persona,
          researchContext: session.researchContext,
          messages: session.messages,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as {
        analysis: SessionAnalysis;
        fallback?: boolean;
      };
      setAnalysis(data.analysis);
      setIsAiGenerated(!data.fallback);
      if (data.fallback) {
        // Don't persist baseline output, otherwise a reload would restore it
        // and incorrectly show the "AI analysis" badge.
        setError("AI analysis unavailable. Showing baseline feedback.");
      } else {
        saveSessionAnalysis(session.id, data.analysis, session.messages.length);
      }
    } catch {
      // Network/route failure: keep the placeholder analysis visible.
      setAnalysis(placeholder);
      setIsAiGenerated(false);
      setError("Analysis unavailable right now. Showing baseline feedback.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [session.id, session.persona, session.researchContext, session.messages, placeholder]);

  const generateAnalysis = useCallback(() => {
    setIsAnalyzing(true);
    setError(null);
    void runAnalysis();
  }, [runAnalysis]);

  // Auto-generate the analysis as soon as a finished interview lands here, so
  // the user never has to press the button for a fresh session. The ref guards
  // against duplicate requests (e.g. React strict-mode double effects).
  const autoRanRef = useRef(false);
  useEffect(() => {
    if (autoRanRef.current || !shouldAutoRun) return;
    autoRanRef.current = true;
    void runAnalysis();
  }, [runAnalysis, shouldAutoRun]);

  const researcherCount = session.messages.filter(
    (m) => m.role === "researcher",
  ).length;
  const participantCount = session.messages.filter(
    (m) => m.role === "participant",
  ).length;
  const isActive = session.status === "active";

  const stats: { label: string; value: number; icon: IconComponent }[] = [
    { label: "Questions asked", value: researcherCount, icon: RiQuestionAnswerLine },
    { label: "Responses", value: participantCount, icon: RiChat3Line },
    { label: "Strong questions", value: analysis.strongQuestions.length, icon: RiThumbUpLine },
    {
      label: "Suggested rewrites",
      value: analysis.suggestedImprovements.length,
      icon: RiSparklingLine,
    },
  ];

  const verdict = getVerdict(analysis);

  const jumpToSection = (key: SectionKey) => {
    setSection(key);
    sectionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-12 sm:px-8 sm:py-14">
      <div className="animate-rise mx-auto flex max-w-2xl flex-col items-center text-center">
        <Eyebrow>Summary</Eyebrow>
        <h1 className="mt-3 text-display-4-semibold text-text-primary sm:text-display-3-semibold">
          Session{" "}
          <span className="relative inline-block whitespace-nowrap text-accent-600">
            summary
            <svg
              aria-hidden
              viewBox="0 0 230 12"
              preserveAspectRatio="none"
              className="absolute right-0 -bottom-1 left-0 h-[0.12em] w-full"
            >
              <path
                d="M4 9 C 60 3, 160 2.5, 226 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength="1"
                className="animate-underline-draw"
              />
            </svg>
          </span>
        </h1>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
          <Tag tone={isActive ? "ink" : "neutral"}>
            {isActive ? "Active session" : "Completed"}
          </Tag>
          <Tag tone={isAnalyzing ? "neutral" : isAiGenerated ? "green" : "yellow"}>
            {isAnalyzing
              ? "Analyzing"
              : isAiGenerated
                ? "AI analysis"
                : "Baseline feedback"}
          </Tag>
        </div>
        <p className="mx-auto mt-3 max-w-md text-body-regular text-text-secondary">
          {isAnalyzing ? (
            "Analyzing your interview transcript."
          ) : (
            <>
              {isAiGenerated ? "AI-generated coaching for " : "Baseline feedback for "}
              <span className="text-body-medium text-text-primary">
                {session.researchContext.projectName || "your rehearsal"}
              </span>
              {isAiGenerated
                ? "."
                : ". Generate AI analysis for transcript-specific coaching."}
            </>
          )}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <Button
            onClick={generateAnalysis}
            disabled={isAnalyzing}
            leadingIcon={isAnalyzing ? SpinnerIcon : isAiGenerated ? RiRefreshLine : RiSparklingLine}
          >
            {isAnalyzing
              ? "Analyzing interview"
              : isAiGenerated
                ? "Regenerate analysis"
                : "Generate analysis"}
          </Button>
          {isActive ? (
            <NavButton variant="secondary" href="/interview">
              Back to interview
            </NavButton>
          ) : null}
          <NavButton variant="secondary" href="/setup">
            New rehearsal
          </NavButton>
        </div>
      </div>

      {error ? (
        <p className="text-center text-body-2-regular text-text-secondary" role="status">
          {error}
        </p>
      ) : null}

      {/* At a glance: verdict, feedback mix, raw numbers */}
      <Reveal>
        <div className="grid overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default divide-separator-border max-lg:divide-y lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:divide-x">
          <div
            className={cx(
              "flex flex-col justify-between gap-6 p-6 transition-colors duration-300 motion-reduce:transition-none sm:p-7",
              verdict.wash,
            )}
          >
            <div>
              <Eyebrow className="text-current opacity-70">At a glance</Eyebrow>
              <p className="mt-3 text-display-4-semibold">{verdict.label}</p>
              <p className="mt-3 max-w-md text-body-regular">{verdict.takeaway}</p>
            </div>
            <GlanceBar analysis={analysis} onSelect={jumpToSection} />
          </div>
          <dl className="grid grid-cols-2 divide-separator-border">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cx(
                  index % 2 === 0 && "border-r border-separator-border",
                  index < 2 && "border-b border-separator-border",
                )}
              >
                <StatTile icon={stat.icon} label={stat.label} value={stat.value} />
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      {analysis.exchanges && analysis.exchanges.length > 0 ? (
        <Reveal>
          <ExchangeBreakdown exchanges={analysis.exchanges} />
        </Reveal>
      ) : null}

      <Reveal>
        <div
          ref={sectionsRef}
          className="grid scroll-mt-24 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <section className="rounded-3xl border border-border-button-default bg-background-primary-default p-5 sm:p-6">
            <h2 className="text-title-2-medium text-text-primary">Coaching notes</h2>
            <Tabs
              selectedKey={section}
              onSelectionChange={setSection}
              className="mt-4"
            >
              <TabList aria-label="Feedback sections" className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {SECTIONS.map((s) => (
                  <Tab key={s.key} id={s.key} count={analysis[s.key].length}>
                    {s.label}
                  </Tab>
                ))}
              </TabList>
              {SECTIONS.map((s) => (
                <TabPanel key={s.key} id={s.key}>
                  <FeedbackList items={analysis[s.key]} accent={s.accent} />
                </TabPanel>
              ))}
            </Tabs>
          </section>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ParticipantCard
              persona={session.persona}
              className="rounded-3xl border border-border-button-default"
            />
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return <RiLoader4Line className={cx(className, "animate-spin")} aria-hidden />;
}
