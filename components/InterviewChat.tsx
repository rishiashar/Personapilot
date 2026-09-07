"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  RiArrowUpLine,
  RiLoader4Line,
  RiVolumeUpLine,
} from "@remixicon/react";

import { AgentThinking } from "@/components/application/agent-thinking/agent-thinking";
import { ComposerLoader } from "@/components/application/composer-loader/composer-loader";
import { Avatar } from "@/components/base/avatar/avatar";
import { LinkButton } from "@/components/base/buttons/link-button";
import type { InterviewMessage } from "@/lib/types";
import {
  useParticipantVoice,
  type VoiceState,
} from "@/lib/useParticipantVoice";
import { getInitials } from "@/lib/utils";
import { cx } from "@/utils/cx";

function VoiceControl({
  state,
  onPlay,
}: {
  state: VoiceState;
  onPlay: () => void;
}) {
  if (state.status === "loading") {
    return (
      <span className="flex items-center gap-1.5 text-caption-1-medium text-text-secondary">
        <RiLoader4Line className="size-3.5 animate-spin" aria-hidden />
        Generating voice…
      </span>
    );
  }

  if (state.status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-caption-1-medium text-text-secondary">
        Voice unavailable. Showing the text response.
      </span>
    );
  }

  const isReady = state.status === "ready";
  return (
    <LinkButton
      variant="secondary"
      size="xs"
      leadingIcon={RiVolumeUpLine}
      onClick={onPlay}
    >
      {isReady ? "Replay audio" : "Play audio"}
    </LinkButton>
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

  if (isResearcher) {
    return (
      <div className="animate-message-in flex justify-end">
        <div className="max-w-[78%] rounded-2xl rounded-br-md bg-accent-500 px-3.5 py-2.5 text-body-regular text-text-white">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-message-in flex items-end gap-2.5">
      <Avatar size="sm" color="blue" initials={personaInitials} />
      <div className="flex flex-col items-start gap-1">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-background-secondary-default px-3.5 py-2.5 text-body-regular text-text-primary">
          {message.text}
        </div>
        {voiceState && onPlayVoice ? (
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
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-4 px-4 py-5 sm:px-6">
          {messages.length === 0 && !isGenerating ? (
            <p className="mx-auto max-w-sm px-5 py-10 text-center text-body-regular text-text-secondary">
              Ask your first interview question below. {personaName} will
              answer in character so you can rehearse your phrasing.
            </p>
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
              <Avatar size="sm" color="blue" initials={personaInitials} />
              <AgentThinking
                variant="wave"
                label={`${personaName} is thinking`}
                showTimer={false}
              />
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-separator-border p-3 sm:p-4">
        {error ? (
          <p
            role="status"
            className="mb-2 text-caption-1-medium text-text-secondary"
          >
            {error}
          </p>
        ) : null}
        <ComposerLoader active={isGenerating}>
          <form
            className={cx(
              "flex h-[52px] w-full items-center gap-2.5 rounded-full p-2 pl-4",
              isGenerating
                ? "bg-transparent"
                : "border border-border-button-default bg-background-primary-default shadow-xs"
            )}
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <input
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
              className="h-5 min-w-0 flex-1 bg-transparent text-body-regular text-text-primary caret-text-primary outline-none placeholder:text-text-tertiary"
            />
            <button
              type="submit"
              disabled={disabled || isGenerating || draft.trim().length === 0}
              aria-label="Send question"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-button-primary text-text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RiArrowUpLine className="size-5" aria-hidden />
            </button>
          </form>
        </ComposerLoader>
      </div>
    </div>
  );
}
