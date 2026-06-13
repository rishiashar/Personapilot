"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ListChecks } from "lucide-react";

import { InterviewChat } from "@/components/InterviewChat";
import { ParticipantCard } from "@/components/ParticipantCard";
import { Tag } from "@/components/Tag";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { VoiceConsole, type VoicePhase } from "@/components/VoiceConsole";
import { Button } from "@/components/ui/button";
import { saveSession } from "@/lib/localStorage";
import { generateMockResponse } from "@/lib/mockResponses";
import type { InterviewMessage, InterviewSession } from "@/lib/types";
import { useParticipantVoice } from "@/lib/useParticipantVoice";
import { useVoiceRecorder } from "@/lib/useVoiceRecorder";
import { cn, createId } from "@/lib/utils";

function RailSection({
  title,
  meta,
  defaultOpen = false,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex min-h-12 w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors hover:bg-muted/60"
      >
        <h2 className="caps">{title}</h2>
        <span className="flex items-center gap-2">
          {meta}
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>
      {open && children}
    </div>
  );
}

function QuestionGuidePanel({ questions }: { questions: string[] }) {
  // Which guide questions the researcher has marked as covered. Ephemeral by
  // design: it's a reading aid during the session, not part of the record.
  const [asked, setAsked] = useState<Set<number>>(new Set());

  const toggle = (index: number) =>
    setAsked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-border px-4 py-2">
        <h2 className="caps">Questions</h2>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {asked.size}/{questions.length}
        </span>
      </div>
      {questions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <ListChecks className="size-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
          <p className="max-w-[24ch] text-sm leading-relaxed text-muted-foreground">
            No question guide for this session. Ask anything you like.
          </p>
        </div>
      ) : (
        <ol className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {questions.map((question, index) => {
          const isAsked = asked.has(index);
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-pressed={isAsked}
                className="group flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-sm leading-relaxed transition-colors hover:bg-muted/60"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center border transition-colors",
                    isAsked
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-input bg-card text-transparent group-hover:border-ring"
                  )}
                >
                  <Check className="size-2.5" strokeWidth={3} />
                </span>
                <span
                  className={cn(
                    isAsked && "text-muted-foreground line-through decoration-border"
                  )}
                >
                  {question}
                </span>
              </button>
            </li>
          );
        })}
        </ol>
      )}
    </div>
  );
}

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

  // Detect voice generation in progress: text is ready (not generating) but
  // the latest participant message's voice is still loading (not yet playing).
  const isGeneratingVoice =
    mode === "voice" &&
    !isGeneratingResponse &&
    !voice.isPlaying &&
    !!lastParticipant &&
    lastVoiceState?.status === "loading";

  const voicePhase: VoicePhase = isCompleted
    ? "idle"
    : recorder.isRecording
      ? "recording"
      : isTranscribing
        ? "transcribing"
        : isGeneratingResponse
          ? "thinking"
          : isGeneratingVoice
            ? "generating_voice"
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
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6">
      {/* One console frame: three columns divided by rules. */}
      <div className="animate-rise grid grid-cols-1 border border-foreground bg-card max-lg:divide-y max-lg:divide-foreground lg:h-[calc(100dvh-8.25rem)] lg:grid-cols-[300px_minmax(0,1fr)_320px] lg:divide-x lg:divide-foreground">
        {/* Left: question guide gets the room; participant and goal stay
            compact at the bottom so the rail reads as a script, not a dossier. */}
        <aside className="flex flex-col lg:min-h-0">
          <div className="min-h-0 flex-1">
            <QuestionGuidePanel
              questions={researchContext.questionGuide ?? []}
            />
          </div>
          <div className="lg:max-h-[55%] lg:overflow-y-auto">
            <RailSection title="Participant" defaultOpen>
              <ParticipantCard persona={persona} collapsible />
            </RailSection>
            <RailSection title="Research goal">
              <div className="space-y-3 px-4 pb-4 text-sm">
                <p className="leading-relaxed">
                  {researchContext.researchGoal ||
                    "No research goal provided yet."}
                </p>
                {researchContext.projectName ? (
                  <div className="space-y-1 border-t border-border pt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Project
                    </p>
                    <p>{researchContext.projectName}</p>
                  </div>
                ) : null}
              </div>
            </RailSection>
          </div>
        </aside>

        {/* Center: voice-first interview (text fallback under a toggle) */}
        <section className="flex min-h-[60vh] flex-col lg:min-h-0">
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2 sm:px-5">
            <h2 className="caps">Interview</h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag
                tone={
                  responseMode === "live"
                    ? "green"
                    : responseMode === "mock"
                      ? "yellow"
                      : "neutral"
                }
              >
                {responseMode === "live"
                  ? "Live AI"
                  : responseMode === "mock"
                    ? "Sample mode"
                    : "AI participant"}
              </Tag>
              <Tag tone={isCompleted ? "neutral" : "ink"}>
                {isCompleted ? "Completed" : "Active"}
              </Tag>
            </div>
          </div>
          <div className="min-h-0 flex-1">
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
          </div>
          <div className="flex justify-center border-t border-border py-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={() => setMode((m) => (m === "voice" ? "text" : "voice"))}
            >
              {mode === "voice" ? "Switch to text" : "Switch to voice"}
            </Button>
          </div>
        </section>

        {/* Right: transcript + end session */}
        <aside className="flex min-h-[420px] flex-col lg:min-h-0">
          <div className="min-h-0 flex-1">
            <TranscriptPanel
              messages={session.messages}
              personaName={persona.name}
            />
          </div>
          <div className="border-t border-border p-3">
            <Button
              variant={isCompleted ? "outline" : "destructive"}
              size="lg"
              className="h-11 w-full"
              onClick={
                isCompleted ? () => router.push("/summary") : handleEndSession
              }
            >
              {isCompleted ? "View summary" : "End session"}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
