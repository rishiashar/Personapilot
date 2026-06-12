# ProbeRoom

**Practice UX interview questions with AI role-play participants before speaking to real users.**

ProbeRoom (ProbeRoom.ai) is an AI-powered UX interview rehearsal tool. A researcher creates a participant persona, adds research context, runs a rehearsal interview against a simulated participant, and reviews structured feedback on their interview technique.

> Synthetic rehearsal, not synthetic research.

The goal is not to replace real users or generate final research insights from AI. The goal is to help researchers rehearse their interview flow, test the quality of their questions, and understand what kind of answers their questions may produce before they enter a real session.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com) component library
- [OpenAI API](https://platform.openai.com) — persona responses, session analysis, voice transcription
- [ElevenLabs API](https://elevenlabs.io) — participant text-to-speech with automatic voice selection
- `localStorage` for MVP persistence (no database, no authentication)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Create a `.env.local` with server-side keys (never prefixed with `NEXT_PUBLIC_`):

```env
OPENAI_API_KEY=your_openai_key
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_DEFAULT_VOICE_ID=your_default_voice_id   # optional fallback
```

If no API keys are set the app falls back to mock responses and text-only mode.

### Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint
```

## User flow

1. **Landing** (`/`) — product intro and a single "Create rehearsal" CTA.
2. **Setup** (`/setup`) — fill in research context and a participant persona (or use the sample UofT student persona). The app automatically selects an ElevenLabs voice for the persona, then creates the interview session.
3. **Interview** (`/interview`) — voice-first interview room. Participant card and research goal on the left, voice console (or text chat) in the center, live transcript on the right. The AI responds in character and ElevenLabs speaks the response aloud.
4. **Summary** (`/summary`) — structured session analysis: strong questions, weak questions, missed follow-ups, suggested improvements, and next-interview tips.

## How it works

```
Researcher speaks (push-to-talk) or types a question
  → OpenAI transcribes speech to text (if voice mode)
  → OpenAI generates a persona response in character
  → ElevenLabs converts the response to speech
  → Transcript is saved to localStorage
  → Researcher continues the interview
```

### Automatic voice selection

During setup, the app calls `/api/select-voice` which:

1. Asks OpenAI to convert the persona into safe voice search criteria (tone, pace, energy, age range, communication style — no protected identity traits).
2. Searches the ElevenLabs shared voice library for candidates.
3. Asks OpenAI to rank and pick the best match.
4. Falls back to `ELEVENLABS_DEFAULT_VOICE_ID` if anything fails.

The selected voice is saved with the persona and used throughout the interview.

## Project structure

```
app/
  page.tsx                    # landing
  setup/page.tsx              # persona + research context setup
  interview/page.tsx          # interview rehearsal room
  summary/page.tsx            # session summary
  api/
    persona-response/route.ts # OpenAI persona response
    session-analysis/route.ts # OpenAI session analysis
    text-to-speech/route.ts   # ElevenLabs TTS
    transcribe/route.ts       # OpenAI speech-to-text
    select-voice/route.ts     # automatic voice discovery + selection

components/
  AppHeader.tsx         ParticipantCard.tsx    TranscriptPanel.tsx
  PersonaForm.tsx       InterviewRoom.tsx      SessionSummary.tsx
  ResearchContextForm.tsx  InterviewChat.tsx   EmptyState.tsx
  VoiceConsole.tsx      ui/                    # shadcn/ui components

lib/
  types.ts              # Persona, ResearchContext, InterviewMessage, InterviewSession, SessionAnalysis
  ai-config.ts          # centralized model names (OpenAI + ElevenLabs)
  openai.ts             # server-only OpenAI client
  elevenlabs.ts         # server-only ElevenLabs TTS + voice search helpers
  mockResponses.ts      # fallback participant answers + sample persona + placeholder analysis
  localStorage.ts       # persona / research context / session persistence
  useStore.ts           # hydration-safe localStorage hooks
  useParticipantVoice.ts # client-side TTS playback management
  useVoiceRecorder.ts   # push-to-talk microphone recording
  utils.ts              # cn, id + time helpers
```

## Fallback behaviour

The app never fully breaks if an API fails:

- **OpenAI persona response fails** → uses mock participant responses
- **ElevenLabs TTS fails** → shows text response with "Voice unavailable" message
- **Voice selection fails** → uses default voice ID
- **Session analysis fails** → shows placeholder analysis
- **localStorage empty/corrupted** → shows empty state guiding back to setup

## Origin

This project came from a real problem during a capstone project at the University of Toronto. Working on UofT Mobile, the team initially asked only utility-based questions ("What links do you open?") which produced shallow answers. Shifting to deeper questions about belonging, identity, and connection changed the quality of insights entirely.

ProbeRoom turns that learning into a product: sometimes users do have deeper insights, but our questions are not opening the right door. This tool helps researchers practice opening that door before they speak to real participants.
