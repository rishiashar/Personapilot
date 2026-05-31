"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Target, Sparkles, Volume2 } from "lucide-react";

import { InterviewChat } from "@/components/InterviewChat";
import { ParticipantCard } from "@/components/ParticipantCard";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveSession } from "@/lib/localStorage";
import { generateMockResponse } from "@/lib/mockResponses";
import type { InterviewMessage, InterviewSession } from "@/lib/types";
import { createId } from "@/lib/utils";

export function InterviewRoom({
  initialSession,
}: {
  initialSession: InterviewSession;
}) {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession>(initialSession);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isCompleted = session.status === "completed";

  const persist = (next: InterviewSession) => {
    setSession(next);
    saveSession(next);
  };

  const handleSend = async (text: string) => {
    if (isCompleted || isGeneratingResponse) return;
    setError(null);

    const researcherMessage: InterviewMessage = {
      id: createId("msg"),
      role: "researcher",
      text,
      createdAt: new Date().toISOString(),
    };

    const withQuestion: InterviewSession = {
      ...session,
      messages: [...session.messages, researcherMessage],
    };
    persist(withQuestion);

    // Seed for the deterministic mock fallback.
    const turn = session.messages.filter(
      (m) => m.role === "participant"
    ).length;

    const controller = new AbortController();
    abortRef.current = controller;
    setIsGeneratingResponse(true);

    let responseText: string;
    try {
      const res = await fetch("/api/persona-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          persona: session.persona,
          researchContext: session.researchContext,
          messages: session.messages,
          latestQuestion: text,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: { response?: string; fallback?: boolean } = await res.json();
      responseText =
        typeof data.response === "string" && data.response.trim().length > 0
          ? data.response
          : generateMockResponse(text, turn);
      if (data.fallback) {
        setError(
          "Showing a sample response. Add an OpenAI API key for live answers."
        );
      }
    } catch {
      // Session was ended mid-request: drop the response silently.
      if (controller.signal.aborted) {
        setIsGeneratingResponse(false);
        return;
      }
      responseText = generateMockResponse(text, turn);
      setError(
        "Couldn't reach the AI participant, so this is a sample response."
      );
    } finally {
      abortRef.current = null;
    }

    const participantMessage: InterviewMessage = {
      id: createId("msg"),
      role: "participant",
      text: responseText,
      createdAt: new Date().toISOString(),
    };
    persist({
      ...withQuestion,
      messages: [...withQuestion.messages, participantMessage],
    });
    setIsGeneratingResponse(false);
  };

  const handleEndSession = () => {
    abortRef.current?.abort();
    setIsGeneratingResponse(false);
    const ended: InterviewSession = {
      ...session,
      status: "completed",
      endedAt: new Date().toISOString(),
    };
    persist(ended);
    router.push("/summary");
  };

  const { persona, researchContext } = session;

  return (
    <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 gap-4 px-4 py-5 sm:px-8 lg:h-[calc(100dvh-9rem)] lg:grid-cols-[290px_minmax(0,1fr)_300px] lg:py-6">
      {/* Left: participant + research goal */}
      <div className="flex flex-col gap-4 lg:min-h-0 lg:overflow-y-auto lg:pr-1">
        <ParticipantCard persona={persona} />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="size-4 text-muted-foreground" />
              Research goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="leading-relaxed text-foreground/90">
              {researchContext.researchGoal || "No research goal provided yet."}
            </p>
            {researchContext.projectName ? (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Project
                  </p>
                  <p className="text-foreground/90">
                    {researchContext.projectName}
                  </p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Center: chat */}
      <Card className="flex min-h-[60vh] flex-col p-0 lg:min-h-0">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              Interview room
            </CardTitle>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="gap-1 font-normal">
                <Sparkles className="size-3" />
                Mock mode
              </Badge>
              <Badge variant="outline" className="gap-1 font-normal">
                <Volume2 className="size-3" />
                Voice enabled
              </Badge>
              <Badge
                variant={isCompleted ? "secondary" : "default"}
                className="font-normal"
              >
                {isCompleted ? "Completed session" : "Active session"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          <InterviewChat
            messages={session.messages}
            personaName={persona.name}
            voiceId={persona.voiceId}
            isGenerating={isGeneratingResponse}
            disabled={isCompleted}
            error={error}
            onSend={handleSend}
          />
        </CardContent>
      </Card>

      {/* Right: transcript + end session */}
      <div className="flex min-h-[420px] flex-col gap-4 lg:min-h-0">
        <div className="min-h-0 flex-1">
          <TranscriptPanel
            messages={session.messages}
            personaName={persona.name}
          />
        </div>
        <Button
          variant={isCompleted ? "outline" : "destructive"}
          size="lg"
          className="w-full"
          onClick={
            isCompleted ? () => router.push("/summary") : handleEndSession
          }
        >
          <Flag />
          {isCompleted ? "View summary" : "End session"}
        </Button>
      </div>
    </div>
  );
}
