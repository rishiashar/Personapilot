/**
 * Centralized AI model configuration.
 *
 * Keep all model names here so they can be changed in one place. These are
 * read server-side by the API routes; they are not exposed to the browser.
 */

export const PERSONA_RESPONSE_MODEL = "gpt-5.4-mini";
export const SESSION_ANALYSIS_MODEL = "gpt-5.4-mini";

/**
 * ElevenLabs voice configuration for participant text-to-speech.
 *
 * Change DEFAULT_ELEVENLABS_VOICE_ID to use a different default voice. It is
 * used whenever a persona does not specify its own voiceId. ELEVENLABS_MODEL_ID
 * controls which ElevenLabs model performs the synthesis.
 */
export const DEFAULT_ELEVENLABS_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
export const ELEVENLABS_MODEL_ID = "eleven_flash_v2_5";
