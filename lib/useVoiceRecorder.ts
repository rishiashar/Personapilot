"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type RecorderError = "permission" | "unsupported" | "failed";

/**
 * Microphone recording for Voice Mode using the browser MediaRecorder API.
 *
 * - Prefers `audio/webm` when supported, otherwise lets the browser pick.
 * - `start()` requests mic permission and begins capturing.
 * - `stop()` resolves with the recorded Blob (or null if nothing usable).
 * - The mic stream is always stopped after recording so the OS indicator clears.
 */
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<RecorderError | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async (): Promise<RecorderError | null> => {
    setError(null);

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setError("unsupported");
      return "unsupported";
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("permission");
      return "permission";
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : undefined;
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        cleanupStream();
        const resolve = stopResolveRef.current;
        stopResolveRef.current = null;
        resolve?.(blob.size > 0 ? blob : null);
      };

      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      return null;
    } catch {
      cleanupStream();
      setError("failed");
      return "failed";
    }
  }, [cleanupStream]);

  const stop = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      recorderRef.current = null;
      setIsRecording(false);
      if (!recorder || recorder.state === "inactive") {
        cleanupStream();
        resolve(null);
        return;
      }
      stopResolveRef.current = resolve;
      recorder.stop();
    });
  }, [cleanupStream]);

  // Stop the mic stream if the component unmounts mid-recording.
  useEffect(() => () => cleanupStream(), [cleanupStream]);

  return { isRecording, error, start, stop };
}
