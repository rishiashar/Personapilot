"use client";

import {
  Loader2,
  Mic,
  RotateCcw,
  Square,
  TriangleAlert,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type VoicePhase =
  | "idle"
  | "recording"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

const PHASE_BADGE: Record<
  Exclude<VoicePhase, "idle">,
  { label: string; className: string }
> = {
  recording: {
    label: "Recording",
    className: "border-transparent bg-red-500/15 text-red-600",
  },
  transcribing: {
    label: "Transcribing",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  thinking: {
    label: "Thinking",
    className: "border-transparent bg-muted text-muted-foreground",
  },
  speaking: {
    label: "Speaking",
    className: "border-transparent bg-primary/10 text-primary",
  },
  error: {
    label: "Needs attention",
    className: "border-transparent bg-muted text-muted-foreground",
  },
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
  const isBusy =
    phase === "transcribing" || phase === "thinking" || phase === "speaking";
  const micDisabled = disabled || isBusy;

  const helper = disabled
    ? "This session has ended."
    : phase === "recording"
      ? "Listening… tap to stop."
      : phase === "transcribing"
        ? "Transcribing what you said…"
        : phase === "thinking"
          ? `${personaName} is thinking…`
          : phase === "speaking"
            ? `${personaName} is speaking…`
            : "Tap the mic and ask your question out loud.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-8 text-center">
        <div className="flex h-6 items-center">
          {phase !== "idle" ? (
            <Badge className={cn("gap-1.5 font-normal", PHASE_BADGE[phase].className)}>
              {(phase === "transcribing" || phase === "thinking") && (
                <Loader2 className="size-3 animate-spin" />
              )}
              {phase === "recording" && (
                <span className="size-2 animate-pulse rounded-full bg-red-500" />
              )}
              {phase === "speaking" && <Volume2 className="size-3" />}
              {PHASE_BADGE[phase].label}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground">
              <Mic className="size-3" />
              Voice rehearsal
            </Badge>
          )}
        </div>

        <div className="relative flex items-center justify-center">
          {isRecording && (
            <span className="absolute inline-flex size-28 animate-ping rounded-full bg-red-500/30" />
          )}
          <Button
            type="button"
            onClick={onToggleRecord}
            disabled={micDisabled}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
            className={cn(
              "relative size-28 rounded-full shadow-sm transition-transform active:scale-95",
              isRecording
                ? "bg-red-500 text-white hover:bg-red-500/90"
                : "bg-primary text-primary-foreground"
            )}
          >
            {isRecording ? (
              <Square className="size-9" />
            ) : (
              <Mic className="size-10" />
            )}
          </Button>
        </div>

        <p className="min-h-5 text-sm text-muted-foreground">{helper}</p>

        {errorMessage ? (
          <p
            role="status"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <TriangleAlert className="size-3.5 shrink-0" />
            {errorMessage}
          </p>
        ) : null}
      </div>

      {lastHeard || lastResponse ? (
        <div className="border-t border-border bg-card/60 px-5 py-4 sm:px-6">
          {lastHeard ? (
            <div className="mb-3 space-y-1">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                You asked
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">
                “{lastHeard}”
              </p>
            </div>
          ) : null}
          {lastResponse ? (
            <>
              {lastHeard ? <Separator className="my-3" /> : null}
              <div className="space-y-2">
                <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  {personaName} replied
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {lastResponse}
                </p>
                {voiceUnavailable ? (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <VolumeX className="size-3" />
                    Voice unavailable, showing text response.
                  </span>
                ) : canReplay ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={onReplay}
                    disabled={phase === "speaking"}
                  >
                    <RotateCcw className="size-3" />
                    Replay
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
