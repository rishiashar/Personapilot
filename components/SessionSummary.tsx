"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Loader2,
  MessageCircle,
  RotateCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { ParticipantCard } from "@/components/ParticipantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buildSessionAnalysis } from "@/lib/mockResponses";
import {
  getSessionAnalysis,
  saveSessionAnalysis,
} from "@/lib/localStorage";
import type { InterviewSession, SessionAnalysis } from "@/lib/types";

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card size="sm">
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

type SectionTone = "positive" | "warning" | "default";

function AnalysisSection({
  icon,
  title,
  badge,
  badgeVariant,
  items,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline";
  items: string[];
  tone?: SectionTone;
}) {
  const dot =
    tone === "positive"
      ? "bg-primary"
      : tone === "warning"
        ? "bg-muted-foreground"
        : "bg-muted-foreground/50";

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            {icon}
            {title}
          </h3>
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
        <Separator />
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={index}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground/90"
              >
                <span className={`mt-2 size-1.5 shrink-0 rounded-full ${dot}`} />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing flagged here for this session.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function SessionSummary({ session }: { session: InterviewSession }) {
  // Placeholder analysis is always available and shown first.
  const placeholder = useMemo(() => buildSessionAnalysis(session), [session]);

  // Restore a previously generated analysis for this exact session, if any,
  // otherwise start from the placeholder. Lazy initializers read localStorage
  // once on mount (this component only renders after the store has hydrated).
  const saved = useMemo(() => getSessionAnalysis(session.id), [session.id]);
  const [analysis, setAnalysis] = useState<SessionAnalysis>(
    saved ?? placeholder
  );
  const [isAiGenerated, setIsAiGenerated] = useState(saved !== null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
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
      saveSessionAnalysis(session.id, data.analysis);
      if (data.fallback) {
        setError("AI analysis unavailable — showing baseline feedback.");
      }
    } catch {
      // Network/route failure: keep the placeholder analysis visible.
      setAnalysis(placeholder);
      setIsAiGenerated(false);
      setError("Analysis unavailable right now — showing baseline feedback.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [session.id, session.persona, session.researchContext, session.messages, placeholder]);

  const researcherCount = session.messages.filter(
    (m) => m.role === "researcher"
  ).length;
  const participantCount = session.messages.filter(
    (m) => m.role === "participant"
  ).length;
  const isActive = session.status === "active";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Session summary
            </h1>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active session" : "Completed session"}
            </Badge>
            <Badge variant={isAiGenerated ? "default" : "outline"}>
              {isAiGenerated ? "AI analysis" : "Baseline feedback"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isAiGenerated
              ? "AI-generated coaching for "
              : "Baseline feedback for "}
            <span className="font-medium text-foreground">
              {session.researchContext.projectName || "your rehearsal"}
            </span>
            {isAiGenerated
              ? "."
              : ". Generate AI analysis for transcript-specific coaching."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generateAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin" />
                Analyzing interview…
              </>
            ) : (
              <>
                <Sparkles />
                {isAiGenerated ? "Regenerate analysis" : "Generate analysis"}
              </>
            )}
          </Button>
          {isActive ? (
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/interview" />}
            >
              <ArrowLeft />
              Back to interview
            </Button>
          ) : null}
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/setup" />}
          >
            <RotateCcw />
            New rehearsal
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-muted-foreground" role="status">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions asked" value={researcherCount} />
        <Stat label="Participant responses" value={participantCount} />
        <Stat label="Strong questions" value={analysis.strongQuestions.length} />
        <Stat
          label="Suggested rewrites"
          value={analysis.suggestedImprovements.length}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <AnalysisSection
            icon={<CheckCircle2 className="size-4 text-primary" />}
            title="Strong questions"
            badge="Strong"
            badgeVariant="default"
            items={analysis.strongQuestions}
            tone="positive"
          />
          <AnalysisSection
            icon={<TriangleAlert className="size-4 text-muted-foreground" />}
            title="Weak questions"
            badge="Needs work"
            badgeVariant="secondary"
            items={analysis.weakQuestions}
            tone="warning"
          />
          <AnalysisSection
            icon={<MessageCircle className="size-4 text-muted-foreground" />}
            title="Missed follow-ups"
            badge="Follow-up"
            badgeVariant="outline"
            items={analysis.missedFollowUps}
          />
          <AnalysisSection
            icon={<Lightbulb className="size-4 text-primary" />}
            title="Suggested improvements"
            badge="Rewrite"
            badgeVariant="default"
            items={analysis.suggestedImprovements}
            tone="positive"
          />
          <AnalysisSection
            icon={<ListChecks className="size-4 text-muted-foreground" />}
            title="Next interview tips"
            badge="Next time"
            badgeVariant="outline"
            items={analysis.nextInterviewTips}
          />
        </div>

        <div className="space-y-4">
          <ParticipantCard persona={session.persona} />
        </div>
      </div>
    </div>
  );
}
