# PersonaPilot

**Practice UX interview questions with AI role play participants before speaking to real users.**

PersonaPilot is an AI UX interview rehearsal tool. A UX researcher creates a
participant persona, adds research context, runs a rehearsal interview against a
simulated participant, watches the transcript build live, and reviews a session
summary with placeholder feedback.

> This is the MVP foundation. Participant responses are currently **mock /
> rule-based** — there is no OpenAI, ElevenLabs, database, or authentication yet.
> All data lives in `localStorage`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- [shadcn/ui](https://ui.shadcn.com) as the base design system
- `localStorage` for MVP persistence

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## User flow

1. **Landing** (`/`) — product intro and a single "Create rehearsal" CTA.
2. **Setup** (`/setup`) — fill in research context + a participant persona
   (or click _Use sample UofT student persona_). Starting a session saves a new
   `InterviewSession` to `localStorage` and routes to the interview room.
3. **Interview** (`/interview`) — participant card + research goal on the left,
   chat in the center, live transcript on the right. Ask questions, get mock
   participant answers, then end the session.
4. **Summary** (`/summary`) — placeholder analysis (strong/weak questions,
   missed follow-ups, suggested rewrites, next-interview tips) plus session stats.

## Project structure

```
app/
  page.tsx            # landing
  setup/page.tsx      # persona + research context setup
  interview/page.tsx  # interview rehearsal room
  summary/page.tsx    # session summary
components/
  AppHeader.tsx        ParticipantCard.tsx   TranscriptPanel.tsx
  PersonaForm.tsx      InterviewRoom.tsx     SessionSummary.tsx
  ResearchContextForm.tsx  InterviewChat.tsx  EmptyState.tsx
  ui/                 # shadcn/ui components
lib/
  types.ts            # Persona, ResearchContext, InterviewMessage, InterviewSession, SessionAnalysis
  mockResponses.ts    # rule-based participant answers + sample persona + placeholder analysis
  localStorage.ts     # persona / research context / session helpers
  useStore.ts         # hydration-safe localStorage hooks
  utils.ts            # cn, id + time helpers
```

## Replacing the mocks later

- **OpenAI** → `lib/mockResponses.ts` (`generateMockResponse`, `buildSessionAnalysis`).
  Swap the rule-based logic for API calls (ideally behind a Next.js route handler
  in `app/api/...`). The call site is `InterviewRoom.handleSend` in
  `components/InterviewRoom.tsx`.
- **ElevenLabs** → add audio playback in `components/InterviewChat.tsx` where the
  participant message bubble is rendered.
- **Database / auth** → replace `lib/localStorage.ts` helpers with persistence /
  session APIs; the rest of the app only depends on those function signatures.
