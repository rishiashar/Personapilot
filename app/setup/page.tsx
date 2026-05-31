"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { PersonaForm, type PersonaDraft } from "@/components/PersonaForm";
import { ResearchContextForm } from "@/components/ResearchContextForm";
import { Button } from "@/components/ui/button";
import {
  savePersona,
  saveResearchContext,
  saveSession,
} from "@/lib/localStorage";
import { SAMPLE_PERSONA } from "@/lib/mockResponses";
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

  const handleStart = () => {
    const fullPersona: Persona = {
      ...persona,
      id: createId("persona"),
      createdAt: new Date().toISOString(),
    };

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
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8">
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Set up your rehearsal
            </h1>
            <p className="text-sm text-muted-foreground">
              Add your research context and participant persona before starting
              the interview.
            </p>
          </div>

          <div className="mt-7 space-y-5">
            <ResearchContextForm value={context} onChange={setContext} />
            <PersonaForm
              value={persona}
              onChange={setPersona}
              onUseSample={() => setPersona(SAMPLE_PERSONA)}
            />
          </div>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {canStart
                ? "Your context and persona are saved as you go."
                : "Add a project name and persona name to begin."}
            </p>
            <Button size="lg" onClick={handleStart} disabled={!canStart}>
              Start interview session
              <ArrowRight />
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
