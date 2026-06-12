"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InterviewMessage } from "@/lib/types";
import {
  useParticipantVoice,
  type VoiceState,
} from "@/lib/useParticipantVoice";
import { cn, getInitials } from "@/lib/utils";

function VoiceControl({
  state,
  onPlay,
}: {
  state: VoiceState;
  onPlay: () => void;
}) {
  if (state.status === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Generating voice…
      </span>
    );
  }

  if (state.status === "error") {
    return (
      <span className="text-xs text-muted-foreground">
        Voice unavailable — showing the text response.
      </span>
    );
  }

  const isReady = state.status === "ready";
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-6 px-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={onPlay}
    >
      {isReady ? "Replay audio" : "Play audio"}
    </Button>
  );
}

function PersonaMark({ initials }: { initials: string }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center bg-foreground text-[10px] font-semibold text-background">
      {initials}
    </span>
  );
}

function MessageBubble({
  message,
  personaInitials,
  voiceState,
  onPlayVoice,
}: {
  message: InterviewMessage;
  personaInitials: string;
  voiceState?: VoiceState;
  onPlayVoice?: () => void;
}) {
  const isResearcher = message.role === "researcher";

  return (
    <div
      className={cn(
        "flex items-end gap-2.5",
        isResearcher ? "justify-end" : "justify-start"
      )}
    >
      {!isResearcher && <PersonaMark initials={personaInitials} />}
      <div
        className={cn(
          "flex max-w-[78%] flex-col gap-1",
          isResearcher ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-[10px] px-3.5 py-2.5 text-sm leading-relaxed",
            isResearcher
              ? "rounded-br-[2px] bg-foreground text-background"
              : "rounded-bl-[2px] bg-muted text-foreground"
          )}
        >
          {message.text}
        </div>
        {!isResearcher && voiceState && onPlayVoice ? (
          <VoiceControl state={voiceState} onPlay={onPlayVoice} />
        ) : null}
      </div>
    </div>
  );
}

export function InterviewChat({
  messages,
  personaName,
  voiceId,
  isGenerating,
  disabled,
  error,
  onSend,
}: {
  messages: InterviewMessage[];
  personaName: string;
  voiceId?: string;
  isGenerating: boolean;
  disabled: boolean;
  error?: string | null;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const personaInitials = getInitials(personaName);
  const { getState, generateAndPlay } = useParticipantVoice();
  const autoPlayedRef = useRef<Set<string>>(new Set());

  const playVoice = useCallback(
    (message: InterviewMessage) => {
      void generateAndPlay(message.id, message.text, voiceId);
    },
    [generateAndPlay, voiceId]
  );

  // Auto-generate and play voice for each new participant message once.
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.role !== "participant") return;
    if (autoPlayedRef.current.has(last.id)) return;
    autoPlayedRef.current.add(last.id);
    void generateAndPlay(last.id, last.text, voiceId);
  }, [messages, generateAndPlay, voiceId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, isGenerating]);

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled || isGenerating) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-4 py-5 sm:px-6">
          {messages.length === 0 && !isGenerating ? (
            <div className="mx-auto max-w-sm px-5 py-10 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Ask your first interview question below. {personaName} will
                answer in character so you can rehearse your phrasing.
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              personaInitials={personaInitials}
              voiceState={
                message.role === "participant"
                  ? getState(message.id)
                  : undefined
              }
              onPlayVoice={
                message.role === "participant"
                  ? () => playVoice(message)
                  : undefined
              }
            />
          ))}

          {isGenerating ? (
            <div className="flex items-end gap-2.5">
              <PersonaMark initials={personaInitials} />
              <div className="flex items-center gap-2 rounded-[10px] rounded-bl-[2px] bg-muted px-3.5 py-3">
                <span className="flex items-center gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                </span>
                <span className="text-xs text-muted-foreground">
                  {personaName} is thinking…
                </span>
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 sm:p-4">
        {error ? (
          <p role="status" className="mb-2 text-xs text-muted-foreground">
            {error}
          </p>
        ) : null}
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            value={draft}
            disabled={disabled || isGenerating}
            placeholder={
              disabled
                ? "This session has ended."
                : isGenerating
                  ? `${personaName} is thinking…`
                  : "Type an interview question…"
            }
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Interview question"
          />
          <Button
            type="submit"
            size="lg"
            className="hover:bg-brand"
            disabled={disabled || isGenerating || draft.trim().length === 0}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
