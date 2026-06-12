import type {
  InterviewSession,
  Persona,
  ResearchContext,
  SessionAnalysis,
} from "@/lib/types";

const KEYS = {
  persona: "proberoom:currentPersona",
  researchContext: "proberoom:currentResearchContext",
  session: "proberoom:currentSession",
  analysis: "proberoom:currentSessionAnalysis",
} as const;

/**
 * Stored alongside the session id and the transcript length it was generated
 * from, so stale analysis isn't shown for a new session or for a session that
 * gained messages after the analysis ran.
 */
export interface StoredSessionAnalysis {
  sessionId: string;
  analysis: SessionAnalysis;
  createdAt: string;
  messageCount?: number;
}

const isBrowser = () => typeof window !== "undefined";

/* ------------------------------------------------------------------ */
/* Pub/sub so React can subscribe via useSyncExternalStore.            */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (isBrowser()) window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    if (isBrowser()) window.removeEventListener("storage", listener);
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

/* ------------------------------------------------------------------ */
/* Cached snapshots (useSyncExternalStore requires stable references). */
/* ------------------------------------------------------------------ */

const cache = new Map<string, { raw: string | null; value: unknown }>();

function snapshot<T>(key: string): T | null {
  if (!isBrowser()) return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }
  const cached = cache.get(key);
  if (cached && cached.raw === raw) {
    return cached.value as T | null;
  }
  let value: T | null = null;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = null;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / serialization errors for the MVP.
  }
  emit();
}

function remove(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
  emit();
}

/* ------------------------------------------------------------------ */
/* Public helpers.                                                     */
/* ------------------------------------------------------------------ */

export function savePersona(persona: Persona): void {
  write(KEYS.persona, persona);
}

export function getPersona(): Persona | null {
  return snapshot<Persona>(KEYS.persona);
}

export function saveResearchContext(context: ResearchContext): void {
  write(KEYS.researchContext, context);
}

export function getResearchContext(): ResearchContext | null {
  return snapshot<ResearchContext>(KEYS.researchContext);
}

export function saveSession(session: InterviewSession): void {
  write(KEYS.session, session);
}

export function getSession(): InterviewSession | null {
  return snapshot<InterviewSession>(KEYS.session);
}

export function clearSession(): void {
  remove(KEYS.session);
  remove(KEYS.analysis);
}

export function saveSessionAnalysis(
  sessionId: string,
  analysis: SessionAnalysis,
  messageCount: number
): void {
  const record: StoredSessionAnalysis = {
    sessionId,
    analysis,
    createdAt: new Date().toISOString(),
    messageCount,
  };
  write(KEYS.analysis, record);
}

/**
 * Returns the saved analysis only when it matches the given session id and
 * was generated from the same number of messages. Records saved before
 * messageCount existed are treated as stale.
 */
export function getSessionAnalysis(
  sessionId: string,
  messageCount: number
): SessionAnalysis | null {
  const record = snapshot<StoredSessionAnalysis>(KEYS.analysis);
  if (
    record &&
    record.sessionId === sessionId &&
    record.messageCount === messageCount
  ) {
    return record.analysis;
  }
  return null;
}
