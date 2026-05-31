import "server-only";

import OpenAI from "openai";

/**
 * Server-only OpenAI client. The API key is read from the OPENAI_API_KEY
 * environment variable and is never exposed to the browser. Importing this
 * file from a client component will fail the build thanks to "server-only".
 */

let client: OpenAI | null = null;

/** True when an OpenAI API key is configured in the environment. */
export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Returns a cached OpenAI client, or null when no API key is configured so
 * callers can fall back to mock responses instead of throwing.
 */
export function getOpenAIClient(): OpenAI | null {
  if (!isOpenAIConfigured()) return null;
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}
