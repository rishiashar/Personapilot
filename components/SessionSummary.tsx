"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ParticipantCard } from "@/components/ParticipantCard";
import { Tag, type TagTone } from "@/components/Tag";
import { Button } from "@/components/ui/button";
import { buildSessionAnalysis } from "@/lib/mockResponses";
import { getSessionAnalysis, saveSessionAnalysis } from "@/lib/localStorage";
import type { InterviewSession, SessionAnalysis } from "@/lib/types";

function AnalysisSection({
  title,
  tag,
  tagTone,
  items,
}: {
  title: string;
  tag: string;
  tagTone: TagTone;
  items: string[];
}) {
  return (
    <section id={sectionId(title)} className="scroll-mt-24 border-t border-foreground pt-5 pb-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        <Tag tone={tagTone}>
          {tag} · {items.length}
        </Tag>
      </div>
      {items.length > 0 ? (
        <ol className="mt-4 space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="grid grid-cols-[24px_minmax(0,1fr)] gap-2 text-sm leading-relaxed"
            >
              <span className="pt-px font-mono text-xs text-muted-foreground/80">
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Nothing flagged here for this session.
        </p>
      )}
    </section>
  );
}

function sectionId(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
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

const GLANCE_SEGMENTS = [
  {
    key: "strongQuestions",
    label: "Strong",
    title: "Strong questions",
    bar: "bg-wash-green-fg",
    chip: "bg-wash-green text-wash-green-fg",
  },
  {
    key: "weakQuestions",
    label: "Needs work",
    title: "Weak questions",
    bar: "bg-wash-amber-fg",
    chip: "bg-wash-amber text-wash-amber-fg",
  },
  {
    key: "missedFollowUps",
    label: "Missed",
    title: "Missed follow-ups",
    bar: "bg-wash-red-fg",
    chip: "bg-wash-red text-wash-red-fg",
  },
  {
    key: "suggestedImprovements",
    label: "Rewrites",
    title: "Suggested improvements",
    bar: "bg-wash-blue-fg",
    chip: "bg-wash-blue text-wash-blue-fg",
  },
] as const;

// Glanceable breakdown: a proportional bar of the feedback mix plus jump
// links into each section.
function GlanceBar({ analysis }: { analysis: SessionAnalysis }) {
  const counts = GLANCE_SEGMENTS.map((s) => ({
    ...s,
    count: analysis[s.key].length,
  }));
  const total = counts.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-2.5 w-full overflow-hidden border border-foreground" aria-hidden>
        {counts.map((s) =>
          s.count > 0 ? (
            <span
              key={s.key}
              className={s.bar}
              style={{ width: `${(s.count / total) * 100}%` }}
            />
          ) : null
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {counts.map((s) => (
          <a
            key={s.key}
            href={`#${sectionId(s.title)}`}
            className={`inline-flex h-[22px] items-center gap-1.5 px-2 text-[10px] leading-none font-semibold tracking-[0.06em] uppercase ${s.chip}`}
          >
            {s.label}
            <span className="font-mono tabular-nums">{s.count}</span>
          </a>
        ))}
      </div>
    </div>
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
    [session.id, session.messages.length]
  );
  const [analysis, setAnalysis] = useState<SessionAnalysis>(
    saved ?? placeholder
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
    (m) => m.role === "researcher"
  ).length;
  const participantCount = session.messages.filter(
    (m) => m.role === "participant"
  ).length;
  const isActive = session.status === "active";

  const stats: { label: string; value: number }[] = [
    { label: "Questions asked", value: researcherCount },
    { label: "Responses", value: participantCount },
    { label: "Strong questions", value: analysis.strongQuestions.length },
    {
      label: "Suggested rewrites",
      value: analysis.suggestedImprovements.length,
    },
  ];

  const verdict = getVerdict(analysis);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-5 py-12 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="caps text-muted-foreground">Summary</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] sm:text-[2.6rem]">
            Session summary
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Tag tone={isActive ? "ink" : "neutral"}>
              {isActive ? "Active session" : "Completed"}
            </Tag>
            <Tag
              tone={isAnalyzing ? "neutral" : isAiGenerated ? "green" : "yellow"}
            >
              {isAnalyzing
                ? "Analyzing"
                : isAiGenerated
                  ? "AI analysis"
                  : "Baseline feedback"}
            </Tag>
          </div>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {isAnalyzing ? (
              "Analyzing your interview transcript…"
            ) : (
              <>
                {isAiGenerated
                  ? "AI-generated coaching for "
                  : "Baseline feedback for "}
                <span className="font-medium text-foreground">
                  {session.researchContext.projectName || "your rehearsal"}
                </span>
                {isAiGenerated
                  ? "."
                  : ". Generate AI analysis for transcript-specific coaching."}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="hover:bg-brand"
            onClick={generateAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing interview…
              </>
            ) : isAiGenerated ? (
              "Regenerate analysis"
            ) : (
              "Generate analysis"
            )}
          </Button>
          {isActive ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/interview" />}
            >
              Back to interview
            </Button>
          ) : null}
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/setup" />}
          >
            New rehearsal
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-muted-foreground" role="status">
          {error}
        </p>
      ) : null}

      {/* At a glance: verdict, feedback mix, raw numbers */}
      <div className="grid border border-foreground max-lg:divide-y lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:divide-x divide-foreground">
        <div className={`flex flex-col justify-between gap-6 p-6 sm:p-7 ${verdict.wash}`}>
          <div>
            <p className="caps opacity-70">At a glance</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {verdict.label}
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed">
              {verdict.takeaway}
            </p>
          </div>
          <GlanceBar analysis={analysis} />
        </div>
        <dl className="grid grid-cols-2 max-lg:divide-y divide-foreground">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`bg-card px-4 py-4 sm:px-5 ${index % 2 === 0 ? "border-r border-foreground" : ""} ${index < 2 ? "lg:border-b lg:border-foreground" : ""}`}
            >
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs font-medium text-muted-foreground">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <AnalysisSection
            title="Strong questions"
            tag="Strong"
            tagTone="green"
            items={analysis.strongQuestions}
          />
          <AnalysisSection
            title="Weak questions"
            tag="Needs work"
            tagTone="yellow"
            items={analysis.weakQuestions}
          />
          <AnalysisSection
            title="Missed follow-ups"
            tag="Follow-up"
            tagTone="red"
            items={analysis.missedFollowUps}
          />
          <AnalysisSection
            title="Suggested improvements"
            tag="Rewrite"
            tagTone="blue"
            items={analysis.suggestedImprovements}
          />
          <AnalysisSection
            title="Next interview tips"
            tag="Next time"
            tagTone="neutral"
            items={analysis.nextInterviewTips}
          />
        </div>

        <div>
          <ParticipantCard
            persona={session.persona}
            className="border border-foreground"
          />
        </div>
      </div>
    </div>
  );
}
