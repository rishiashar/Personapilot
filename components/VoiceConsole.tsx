"use client";

import { Loader2, Mic, Square } from "lucide-react";

import { Tag, type TagTone } from "@/components/Tag";
import { Waveform } from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VoicePhase =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "generating_voice"
  | "speaking"
  | "error";

const PHASE_TAG: Record<
  Exclude<VoicePhase, "idle">,
  { label: string; tone: TagTone; spinner?: boolean }
> = {
  recording: { label: "Recording", tone: "red" },
  transcribing: { label: "Transcribing", tone: "neutral", spinner: true },
  thinking: { label: "Thinking", tone: "neutral", spinner: true },
  generating_voice: { label: "Preparing voice", tone: "neutral", spinner: true },
  speaking: { label: "Speaking", tone: "green" },
  error: { label: "Needs attention", tone: "yellow" },
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
        ? "Transcribing what you said…"
        : phase === "thinking"
          ? `${personaName} is thinking…`
          : phase === "generating_voice"
            ? `${personaName} is preparing to speak…`
            : phase === "speaking"
              ? `${personaName} is speaking…`
              : "Tap the mic and ask your question out loud.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-7 px-6 py-10 text-center">
        <div className="flex h-6 items-center">
          {phase !== "idle" ? (
            <Tag tone={PHASE_TAG[phase].tone}>
              {PHASE_TAG[phase].spinner && (
                <Loader2 className="size-3 animate-spin" />
              )}
              {phase === "recording" && (
                <span className="size-1.5 animate-pulse rounded-full bg-wash-red-fg" />
              )}
              {PHASE_TAG[phase].label}
            </Tag>
          ) : (
            <Tag>Voice mode</Tag>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          {isRecording && (
            <span className="absolute inline-flex size-28 animate-ping rounded-full bg-destructive/20" />
          )}
          <Button
            type="button"
            onClick={onToggleRecord}
            disabled={micDisabled}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={cn(
              "relative size-24 rounded-full text-white transition-colors duration-150 active:scale-[0.97]",
              isRecording
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-foreground hover:bg-brand"
            )}
          >
            {isRecording ? (
              <Square className="size-8" />
            ) : (
              <Mic className="size-9" />
            )}
          </Button>
        </div>

        <div className="flex min-h-12 flex-col items-center gap-2.5">
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {helper}
          </p>
          {isSpeaking && (
            <Waveform
              count={28}
              maxHeight={18}
              className="h-5 w-36 text-brand"
            />
          )}
        </div>

        {errorMessage ? (
          <p role="status" className="max-w-sm text-xs text-muted-foreground">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {lastHeard || lastResponse ? (
        <div className="divide-y divide-border border-t border-border">
          {lastHeard ? (
            <div className="px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold text-muted-foreground">
                You asked
              </p>
              <p className="mt-1 text-sm leading-relaxed">{lastHeard}</p>
            </div>
          ) : null}
          {lastResponse ? (
            <div className="px-5 py-4 sm:px-6">
              <p className="text-xs font-semibold text-brand">
                {personaName} replied
              </p>
              <p className="mt-1 text-sm leading-relaxed">{lastResponse}</p>
              {voiceUnavailable ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Voice unavailable. Showing the text response.
                </p>
              ) : canReplay ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                  onClick={onReplay}
                  disabled={phase === "speaking"}
                >
                  Replay audio
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
