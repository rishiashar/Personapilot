"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { PersonaForm, type PersonaDraft } from "@/components/PersonaForm";
import { ResearchContextForm } from "@/components/ResearchContextForm";
import { Button } from "@/components/ui/button";
import {
  savePersona,
  saveResearchContext,
  saveSession,
} from "@/lib/localStorage";
import { SAMPLE_PERSONA, SAMPLE_RESEARCH_CONTEXT } from "@/lib/mockResponses";
import type { InterviewSession, Persona, ResearchContext } from "@/lib/types";
import { createId } from "@/lib/utils";

const EMPTY_CONTEXT: ResearchContext = {
  projectName: "",
  researchGoal: "",
  productContext: "",
  targetAudience: "",
  keyLearningGoals: "",
};

const EMPTY_PERSONA: PersonaDraft = {
  name: "",
  role: "",
  ageRange: "",
  background: "",
  behaviours: "",
  goals: "",
  frustrations: "",
  voiceStyle: "",
};

export default function SetupPage() {
  const router = useRouter();
  const [context, setContext] = useState<ResearchContext>(EMPTY_CONTEXT);
  const [persona, setPersona] = useState<PersonaDraft>(EMPTY_PERSONA);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    if (isStarting) return;
    setIsStarting(true);

    const fullPersona: Persona = {
      ...persona,
      id: createId("persona"),
      createdAt: new Date().toISOString(),
    };

    // Auto-select a voice for the persona (non-blocking: falls back on failure).
    try {
      const res = await fetch("/api/select-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: fullPersona, researchContext: context }),
      });
      if (res.ok) {
        const voice = (await res.json()) as {
          voiceId?: string;
          voiceName?: string;
          voiceSelectionReason?: string;
          voiceSource?: string;
        };
        if (voice.voiceId) {
          fullPersona.voiceId = voice.voiceId;
          fullPersona.voiceName = voice.voiceName;
          fullPersona.voiceSelectionReason = voice.voiceSelectionReason;
          fullPersona.voiceSource =
            (voice.voiceSource as Persona["voiceSource"]) ?? "elevenlabs_search";
        }
      }
    } catch {
      // Voice selection is best-effort; continue without it.
    }

    const session: InterviewSession = {
      id: createId("session"),
      persona: fullPersona,
      researchContext: context,
      messages: [],
      status: "active",
      createdAt: new Date().toISOString(),
    };

    savePersona(fullPersona);
    saveResearchContext(context);
    saveSession(session);
    router.push("/interview");
  };

  const canStart =
    persona.name.trim().length > 0 && context.projectName.trim().length > 0;

  return (
    <>
      <AppHeader step="setup" />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
          <header className="max-w-xl pb-12">
            <p className="caps text-muted-foreground">Setup</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-[2.6rem]">
              Set up your rehearsal
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Describe the study and the participant you want to rehearse
              with. Two minutes here makes the interview believable.
            </p>
          </header>

          <div className="space-y-14">
            <ResearchContextForm
              value={context}
              onChange={setContext}
              onUseSample={() => setContext(SAMPLE_RESEARCH_CONTEXT)}
            />
            <PersonaForm
              value={persona}
              onChange={setPersona}
              onUseSample={() => setPersona(SAMPLE_PERSONA)}
            />
          </div>

          <div className="mt-14 flex flex-col items-stretch gap-4 border-t border-foreground pt-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {canStart
                ? "Your context and persona are saved as you go."
                : "Add a project name and persona name to begin."}
            </p>
            <Button
              size="lg"
              className="h-12 px-7 text-[15px] hover:bg-brand"
              onClick={handleStart}
              disabled={!canStart || isStarting}
            >
              {isStarting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Selecting voice…
                </>
              ) : (
                "Start interview session"
              )}
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
