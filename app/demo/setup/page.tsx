"use client";

import { useState } from "react";

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
        <header className="max-w-xl pb-8">
          <p className="caps text-muted-foreground">Step 3 of 3</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.02em] text-balance sm:text-[2.6rem]">
            What will you ask?
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Optional. Type your questions or import them from a document; they
            stay visible during the interview.
          </p>
        </header>
        <QuestionGuideForm value={questionsText} onChange={setQuestionsText} />
      </div>
    </main>
  );
}
