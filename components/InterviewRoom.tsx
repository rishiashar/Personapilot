"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Keyboard, Mic, Target, Sparkles, Volume2 } from "lucide-react";

import { InterviewChat } from "@/components/InterviewChat";
import { ParticipantCard } from "@/components/ParticipantCard";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { VoiceConsole, type VoicePhase } from "@/components/VoiceConsole";
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
import { useParticipantVoice } from "@/lib/useParticipantVoice";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";
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
  // Tracks the source of the latest participant reply so the header badge
  // reflects reality: null until the first reply, then "live" or "mock".
  const [responseMode, setResponseMode] = useState<"live" | "mock" | null>(
    null
  );
  // Voice Mode is the primary interaction; text is a fallback under a toggle.
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [lastHeard, setLastHeard] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const recorder = useVoiceRecorder();
  const voice = useParticipantVoice();
  const autoPlayedRef = useRef<Set<string>>(new Set());

  const isCompleted = session.status === "completed";

  const persist = (next: InterviewSession) => {
    setSession(next);
    saveSession(next);
  };

  const handleSend = async (
    text: string,
    opts?: { voiceMode?: boolean }
  ) => {
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
          voiceMode: opts?.voiceMode ?? false,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: { response?: string; fallback?: boolean } = await res.json();
      const liveText =
        typeof data.response === "string" && data.response.trim().length > 0
          ? data.response
          : null;
      responseText = liveText ?? generateMockResponse(text, turn);
      const usedFallback = Boolean(data.fallback) || liveText === null;
      setResponseMode(usedFallback ? "mock" : "live");
      if (usedFallback) {
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
      setResponseMode("mock");
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

  // Voice Mode: transcribe the recorded clip, then reuse the existing text
  // question flow (which also saves to localStorage and triggers TTS playback).
  const handleVoiceQuestion = async (blob: Blob | null) => {
    if (!blob) {
      setVoiceError("Didn't catch any audio. Try again.");
      return;
    }
    setVoiceError(null);
    setIsTranscribing(true);
    try {
      const form = new FormData();
      form.append("file", blob, "question.webm");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: { text?: string } = await res.json();
      const text = data.text?.trim() ?? "";
      setIsTranscribing(false);
      if (text.length < 2) {
        setVoiceError("Could not understand audio. Try again.");
        return;
      }
      setLastHeard(text);
      await handleSend(text, { voiceMode: true });
    } catch {
      setIsTranscribing(false);
      setVoiceError("Could not understand audio. Try again.");
    }
  };

  const handleToggleRecord = async () => {
    if (isCompleted) return;
    if (recorder.isRecording) {
      const blob = await recorder.stop();
      await handleVoiceQuestion(blob);
      return;
    }
    setVoiceError(null);
    const failure = await recorder.start();
    if (failure) {
      setVoiceError(
        failure === "permission"
          ? "Microphone access was blocked. Allow mic access, or use text instead."
          : failure === "unsupported"
            ? "Voice recording isn't supported in this browser. Use text instead."
            : "Couldn't start recording. Try again, or use text instead."
      );
    }
  };

  const { persona, researchContext } = session;

  const lastParticipant = [...session.messages]
    .reverse()
    .find((m) => m.role === "participant");
  const lastVoiceState = lastParticipant
    ? voice.getState(lastParticipant.id)
    : undefined;

  // Auto-play each new participant reply once while in Voice Mode (the text
  // view handles its own playback when it is the active mode).
  useEffect(() => {
    if (mode !== "voice") return;
    const last = session.messages[session.messages.length - 1];
    if (!last || last.role !== "participant") return;
    if (autoPlayedRef.current.has(last.id)) return;
    autoPlayedRef.current.add(last.id);
    void voice.generateAndPlay(last.id, last.text, persona.voiceId);
  }, [session.messages, mode, voice, persona.voiceId]);

  const handleReplay = () => {
    if (lastParticipant) {
      void voice.generateAndPlay(
        lastParticipant.id,
        lastParticipant.text,
        persona.voiceId
      );
    }
  };

  const voicePhase: VoicePhase = isCompleted
    ? "idle"
    : recorder.isRecording
      ? "recording"
      : isTranscribing
        ? "transcribing"
        : isGeneratingResponse
          ? "thinking"
          : voice.isPlaying
            ? "speaking"
            : voiceError
              ? "error"
              : "idle";

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

      {/* Center: voice-first interview (text fallback under a toggle) */}
      <Card className="flex min-h-[60vh] flex-col p-0 lg:min-h-0">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              Interview room
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="gap-1 font-normal">
                <Sparkles className="size-3" />
                {responseMode === "live"
                  ? "Live AI"
                  : responseMode === "mock"
                    ? "Mock mode"
                    : "AI participant"}
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
          {mode === "voice" ? (
            <VoiceConsole
              phase={voicePhase}
              personaName={persona.name}
              lastHeard={lastHeard}
              lastResponse={lastParticipant?.text ?? null}
              canReplay={lastVoiceState?.status === "ready"}
              voiceUnavailable={lastVoiceState?.status === "error"}
              errorMessage={voiceError ?? error}
              disabled={isCompleted}
              onToggleRecord={handleToggleRecord}
              onReplay={handleReplay}
            />
          ) : (
            <InterviewChat
              messages={session.messages}
              personaName={persona.name}
              voiceId={persona.voiceId}
              isGenerating={isGeneratingResponse}
              disabled={isCompleted}
              error={error}
              onSend={handleSend}
            />
          )}
        </CardContent>
        <div className="flex justify-center border-t border-border py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() =>
              setMode((m) => (m === "voice" ? "text" : "voice"))
            }
          >
            {mode === "voice" ? (
              <>
                <Keyboard className="size-3.5" />
                Use text instead
              </>
            ) : (
              <>
                <Mic className="size-3.5" />
                Back to voice
              </>
            )}
          </Button>
        </div>
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
