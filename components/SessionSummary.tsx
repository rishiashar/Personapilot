"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  ListChecks,
  MessageCircle,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";

import { ParticipantCard } from "@/components/ParticipantCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { buildSessionAnalysis } from "@/lib/mockResponses";
import type { InterviewSession } from "@/lib/types";

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

function ListSection({
  icon,
  title,
  items,
  tone = "default",
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  tone?: "default" | "positive" | "warning";
}) {
  const dot =
    tone === "positive"
      ? "bg-primary"
      : tone === "warning"
        ? "bg-amber-500"
        : "bg-muted-foreground/50";

  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {icon}
        {title}
      </h3>
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
    </div>
  );
}

export function SessionSummary({ session }: { session: InterviewSession }) {
  const analysis = buildSessionAnalysis(session);
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
          </div>
          <p className="text-sm text-muted-foreground">
            Placeholder feedback for{" "}
            <span className="font-medium text-foreground">
              {session.researchContext.projectName || "your rehearsal"}
            </span>
            . AI-generated analysis will replace this later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
          <Button nativeButton={false} render={<Link href="/setup" />}>
            <RotateCcw />
            Start a new rehearsal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Questions asked" value={researcherCount} />
        <Stat label="Participant responses" value={participantCount} />
        <Stat label="Strong questions" value={analysis.strongQuestions.length} />
        <Stat label="Suggested rewrites" value={analysis.suggestedImprovements.length} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <Card>
          <CardContent className="pt-2">
            <Tabs defaultValue="overview">
              <TabsList className="w-full">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="feedback">Question feedback</TabsTrigger>
                <TabsTrigger value="next">Next steps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-5">
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    You asked{" "}
                    <span className="font-medium">{researcherCount}</span>{" "}
                    {researcherCount === 1 ? "question" : "questions"} and
                    received{" "}
                    <span className="font-medium">{participantCount}</span>{" "}
                    simulated{" "}
                    {participantCount === 1 ? "response" : "responses"}. Use the
                    feedback tabs to review question quality and plan your next
                    rehearsal.
                  </p>
                  <Separator />
                  <ListSection
                    icon={<CheckCircle2 className="size-4 text-primary" />}
                    title="What went well"
                    items={analysis.strongQuestions}
                    tone="positive"
                  />
                </div>
              </TabsContent>

              <TabsContent value="feedback" className="space-y-6 pt-5">
                <ListSection
                  icon={<CheckCircle2 className="size-4 text-primary" />}
                  title="Strong questions"
                  items={analysis.strongQuestions}
                  tone="positive"
                />
                <Separator />
                <ListSection
                  icon={<TriangleAlert className="size-4 text-amber-500" />}
                  title="Weak questions"
                  items={analysis.weakQuestions}
                  tone="warning"
                />
                <Separator />
                <ListSection
                  icon={<MessageCircle className="size-4 text-muted-foreground" />}
                  title="Missed follow-ups"
                  items={analysis.missedFollowUps}
                />
              </TabsContent>

              <TabsContent value="next" className="space-y-6 pt-5">
                <ListSection
                  icon={<Lightbulb className="size-4 text-primary" />}
                  title="Suggested improved questions"
                  items={analysis.suggestedImprovements}
                  tone="positive"
                />
                <Separator />
                <ListSection
                  icon={<ListChecks className="size-4 text-muted-foreground" />}
                  title="Next interview tips"
                  items={analysis.nextInterviewTips}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <ParticipantCard persona={session.persona} />
        </div>
      </div>
    </div>
  );
}
