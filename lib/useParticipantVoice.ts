"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "loading" | "ready" | "error";

export interface VoiceState {
  status: VoiceStatus;
  url?: string;
}

/**
 * Manages ElevenLabs text-to-speech playback for participant messages.
 *
 * Audio is fetched from the server route, cached as a temporary object URL per
 * message (no persistence), and revoked on unmount. Failures are surfaced as an
 * "error" status so the UI can show a text-only fallback without retrying.
 */
export function useParticipantVoice() {
  const [stateById, setStateById] = useState<Record<string, VoiceState>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlsRef = useRef<Record<string, string>>({});

  // Revoke any object URLs we created when the component unmounts.
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      audioRef.current?.pause();
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const play = useCallback((url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    // Autoplay can be rejected by the browser; that's fine, the cached audio
    // stays available behind the Play button.
    void audio.play().catch(() => {});
  }, []);

  const generateAndPlay = useCallback(
    async (messageId: string, text: string, voiceId?: string) => {
      const cachedUrl = urlsRef.current[messageId];
      if (cachedUrl) {
        play(cachedUrl);
        return;
      }
      if (stateById[messageId]?.status === "loading") return;

      setStateById((prev) => ({
        ...prev,
        [messageId]: { status: "loading" },
      }));

      try {
        const res = await fetch("/api/text-to-speech", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId }),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlsRef.current[messageId] = url;
        setStateById((prev) => ({
          ...prev,
          [messageId]: { status: "ready", url },
        }));
        play(url);
      } catch {
        setStateById((prev) => ({
          ...prev,
          [messageId]: { status: "error" },
        }));
      }
    },
    [play, stateById]
  );

  const getState = useCallback(
    (messageId: string): VoiceState =>
      stateById[messageId] ?? { status: "idle" },
    [stateById]
  );

  return { getState, generateAndPlay };
}
