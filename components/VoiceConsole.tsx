"use client";

import { RiMicLine, RiStopFill, RiVolumeUpLine } from "@remixicon/react";

import {
  AgentThinking,
  type AgentThinkingVariant,
} from "@/components/application/agent-thinking/agent-thinking";
import { LinkButton } from "@/components/base/buttons/link-button";
import { Tag, type TagTone } from "@/components/Tag";
import { Waveform } from "@/components/Waveform";
import { cx } from "@/utils/cx";

export type VoicePhase =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "generating_voice"
  | "speaking"
  | "error";

const PHASE_TAG: Partial<Record<VoicePhase, { label: string; tone: TagTone }>> = {
  recording: { label: "Recording", tone: "red" },
  speaking: { label: "Speaking", tone: "green" },
  error: { label: "Needs attention", tone: "yellow" },
};

// Busy phases show the agent-thinking indicator instead of a static chip.
const PHASE_THINKING: Partial<
  Record<VoicePhase, { variant: AgentThinkingVariant; label: (name: string) => string }>
> = {
  transcribing: { variant: "spin", label: () => "Transcribing" },
  thinking: { variant: "wave", label: (name) => `${name} is thinking` },
  generating_voice: { variant: "stars", label: () => "Preparing voice" },
};

export function VoiceConsole({
  phase,
  personaName,
  lastHeard,
  lastResponse,
  canReplay,
  voiceUnavailable,
  errorMessage,
  disabled,
  onToggleRecord,
  onReplay,
}: {
  phase: VoicePhase;
  personaName: string;
  lastHeard: string | null;
  lastResponse: string | null;
  canReplay: boolean;
  voiceUnavailable: boolean;
  errorMessage: string | null;
  disabled: boolean;
  onToggleRecord: () => void;
  onReplay: () => void;
}) {
  const isRecording = phase === "recording";
  const isSpeaking = phase === "speaking";
  const isBusy =
    phase === "transcribing" ||
    phase === "thinking" ||
    phase === "generating_voice" ||
    phase === "speaking";
  const micDisabled = disabled || isBusy;

  const helper = disabled
    ? "This session has ended."
    : phase === "recording"
      ? "Listening. Tap to stop."
      : phase === "transcribing"
        ? "Transcribing what you said."
        : phase === "thinking"
          ? `${personaName} is thinking.`
          : phase === "generating_voice"
            ? `${personaName} is preparing to speak.`
            : phase === "speaking"
              ? `${personaName} is speaking.`
              : "Tap the mic and ask your question out loud.";

  const thinking = PHASE_THINKING[phase];
  const tag = PHASE_TAG[phase];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-6 py-10 text-center">
        <div className="flex h-6 items-center">
          {thinking ? (
            <AgentThinking
              variant={thinking.variant}
              label={thinking.label(personaName)}
              showTimer={false}
            />
          ) : tag ? (
            <Tag tone={tag.tone}>
              {phase === "recording" && (
                <span className="size-1.5 animate-pulse rounded-full bg-current" />
              )}
              {tag.label}
            </Tag>
          ) : (
            <Tag>Voice mode</Tag>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          {isRecording && (
            <span className="absolute inline-flex size-28 animate-ping rounded-full bg-wash-red" />
          )}
          <button
            type="button"
            onClick={onToggleRecord}
            disabled={micDisabled}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={cx(
              "relative flex size-24 cursor-pointer items-center justify-center rounded-full text-text-white shadow-md",
              "transition-[filter,opacity] duration-150 ease hover:brightness-[1.06] active:brightness-95",
              "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none",
              isRecording ? "bg-button-danger" : "bg-button-primary",
            )}
          >
            {isRecording ? (
              <RiStopFill className="size-8" aria-hidden />
            ) : (
              <RiMicLine className="size-9" aria-hidden />
            )}
          </button>
        </div>

        <div className="flex min-h-12 flex-col items-center gap-2.5">
          <p className="max-w-xs text-body-regular text-text-secondary">{helper}</p>
          {isSpeaking && (
            <Waveform count={28} maxHeight={18} className="h-5 w-36" />
          )}
        </div>

        {errorMessage ? (
          <p role="status" className="max-w-sm text-caption-1-medium text-text-secondary">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {lastHeard || lastResponse ? (
        <div className="divide-y divide-separator-border border-t border-separator-border">
          {lastHeard ? (
            <div key={lastHeard} className="animate-message-in px-5 py-4 sm:px-6">
              <p className="text-caption-1-semibold text-text-tertiary">You asked</p>
              <p className="mt-1 text-body-regular text-text-primary">{lastHeard}</p>
            </div>
          ) : null}
          {lastResponse ? (
            <div key={lastResponse} className="animate-message-in px-5 py-4 sm:px-6">
              <p className="text-caption-1-semibold text-accent-600">
                {personaName} replied
              </p>
              <p className="mt-1 text-body-regular text-text-primary">{lastResponse}</p>
              {voiceUnavailable ? (
                <p className="mt-1.5 text-caption-1-medium text-text-secondary">
                  Voice unavailable. Showing the text response.
                </p>
              ) : canReplay ? (
                <LinkButton
                  variant="secondary"
                  size="xs"
                  leadingIcon={RiVolumeUpLine}
                  className="mt-2"
                  onClick={onReplay}
                  disabled={phase === "speaking"}
                >
                  Replay audio
                </LinkButton>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
