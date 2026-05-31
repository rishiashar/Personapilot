"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Target, Sparkles } from "lucide-react";

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
  const [isTyping, setIsTyping] = useState(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const isCompleted = session.status === "completed";

  const persist = (next: InterviewSession) => {
    sessionRef.current = next;
    setSession(next);
    saveSession(next);
  };

  const handleSend = (text: string) => {
    if (isCompleted) return;

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

    const turn = withQuestion.messages.filter(
      (m) => m.role === "participant"
    ).length;

    setIsTyping(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const participantMessage: InterviewMessage = {
        id: createId("msg"),
        role: "participant",
        text: generateMockResponse(text, turn),
        createdAt: new Date().toISOString(),
      };
      const base = sessionRef.current;
      persist({
        ...base,
        messages: [...base.messages, participantMessage],
      });
      setIsTyping(false);
    }, 900);
  };

  const handleEndSession = () => {
    if (replyTimer.current) clearTimeout(replyTimer.current);
    setIsTyping(false);
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
            isTyping={isTyping}
            disabled={isCompleted}
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
