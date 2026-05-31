"use client";

import { useSyncExternalStore } from "react";

import { getSession, subscribe } from "@/lib/localStorage";
import type { InterviewSession } from "@/lib/types";

/**
 * True only after the component has hydrated on the client. Lets pages
 * avoid flashing an empty state before localStorage can be read.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

/** Live view of the current interview session from localStorage. */
export function useSession(): InterviewSession | null {
  return useSyncExternalStore(subscribe, getSession, () => null);
}
