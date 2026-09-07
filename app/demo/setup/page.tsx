"use client";

import { useState } from "react";

import { Eyebrow } from "@/components/Eyebrow";
import { QuestionGuideForm } from "@/components/QuestionGuideForm";
import { DEMO_SESSION } from "@/lib/demoSession";

const DEMO_QUESTIONS = (
  DEMO_SESSION.researchContext.questionGuide ?? []
).join("\n");

export default function DemoSetupPage() {
  const [questionsText, setQuestionsText] = useState(DEMO_QUESTIONS);

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8">
        <header className="mx-auto max-w-xl pb-8 text-center">
          <Eyebrow>Step 3 of 3</Eyebrow>
          <h1 className="mt-3 text-display-4-semibold text-balance text-text-primary sm:text-display-3-semibold">
            What will you ask?
          </h1>
          <p className="mt-4 text-headline-regular text-text-secondary">
            Optional. Your questions stay visible during the interview.
          </p>
        </header>
        <div className="rounded-3xl border border-border-button-default bg-background-primary-default p-6 sm:p-10">
          <QuestionGuideForm value={questionsText} onChange={setQuestionsText} />
        </div>
      </div>
    </main>
  );
}
