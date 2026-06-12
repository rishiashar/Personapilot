"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceStatus = "idle" | "loading" | "ready" | "error";

export interface VoiceState {
  status: VoiceStatus;
  url?: string;
}

/** True when the browser can stream MP3 playback through MediaSource. */
function canStreamMpeg(): boolean {
  return (
    typeof MediaSource !== "undefined" &&
    MediaSource.isTypeSupported("audio/mpeg")
  );
}

/**
 * Pipes an MP3 byte stream into a MediaSource and starts playback via `play`
 * as soon as the first chunk is buffered. Resolves with the collected chunks
 * once the stream ends so the caller can cache the full file.
 */
async function streamThroughMediaSource(
  body: ReadableStream<Uint8Array>,
  play: (url: string) => void
): Promise<Uint8Array[]> {
  const mediaSource = new MediaSource();
  const mediaUrl = URL.createObjectURL(mediaSource);

  await new Promise<void>((resolve) => {
    mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
    play(mediaUrl);
  });

  const sourceBuffer = mediaSource.addSourceBuffer("audio/mpeg");
  const append = (chunk: Uint8Array) =>
    new Promise<void>((resolve, reject) => {
      sourceBuffer.addEventListener("updateend", () => resolve(), {
        once: true,
      });
      sourceBuffer.addEventListener("error", () => reject(new Error("append failed")), {
        once: true,
      });
      sourceBuffer.appendBuffer(chunk as unknown as BufferSource);
    });

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      await append(value);
    }
    if (mediaSource.readyState === "open") mediaSource.endOfStream();
  } finally {
    URL.revokeObjectURL(mediaUrl);
  }
  return chunks;
}

/**
 * Manages ElevenLabs text-to-speech playback for participant messages.
 *
 * Audio is streamed from the server route through MediaSource so playback
 * starts on the first chunk instead of waiting for the full file (with a
 * buffered-blob fallback where MediaSource is unavailable, e.g. Safari).
 * Completed audio is cached as a temporary object URL per message (no
 * persistence) and revoked on unmount. Failures are surfaced as an "error"
 * status so the UI can show a text-only fallback without retrying.
 */
export function useParticipantVoice() {
  const [stateById, setStateById] = useState<Record<string, VoiceState>>({});
  // Whether participant audio is currently playing, so callers (e.g. Voice
  // Mode) can show a "speaking" state and disable the mic while it plays.
  const [isPlaying, setIsPlaying] = useState(false);
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
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    audio.pause();
    audio.src = url;
    audio.currentTime = 0;
    // Autoplay can be rejected by the browser; that's fine, the cached audio
    // stays available behind the Play button.
    void audio.play().catch(() => setIsPlaying(false));
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

        if (res.body && canStreamMpeg()) {
          // Stream: start playback on the first chunk, keep appending as the
          // rest arrives, and cache the assembled file for replays.
          const chunks = await streamThroughMediaSource(res.body, play);
          const blob = new Blob(chunks as BlobPart[], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);
          urlsRef.current[messageId] = url;
          setStateById((prev) => ({
            ...prev,
            [messageId]: { status: "ready", url },
          }));
        } else {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          urlsRef.current[messageId] = url;
          setStateById((prev) => ({
            ...prev,
            [messageId]: { status: "ready", url },
          }));
          play(url);
        }
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

  return { getState, generateAndPlay, isPlaying };
}
