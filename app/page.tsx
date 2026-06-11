import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { GradientWave } from "@/components/GradientWave";
import {
  FeedbackIcon,
  InterviewIcon,
  SetupIcon,
} from "@/components/SessionIcons";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Set up the study",
    description:
      "Define your research goal, build the participant persona, and paste or upload the questions you plan to ask.",
    meta: "2 min",
    icon: SetupIcon,
    tile: "bg-wash-blue text-wash-blue-fg",
  },
  {
    title: "Run the interview",
    description:
      "Ask your questions out loud with your guide beside you. The persona answers in character, in a matched voice.",
    meta: "10–20 min",
    icon: InterviewIcon,
    tile: "bg-wash-green text-wash-green-fg",
  },
  {
    title: "Read the feedback",
    description:
      "Strong questions, weak questions, missed follow-ups, and suggested rewrites you can take into the next session.",
    meta: "Instant",
    icon: FeedbackIcon,
    tile: "bg-wash-amber text-wash-amber-fg",
  },
];

export default function HomePage() {
  return (
    <>
      <AppHeader mode="Beta" />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
          <h1 className="max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.03em] text-balance sm:text-7xl">
            Rehearse your user interviews.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A practice room for UX researchers. Build a participant persona,
            interview it by voice, and get direct feedback on your questioning
            technique.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Button
              size="lg"
              className="h-12 px-7 text-[15px] hover:bg-brand"
              nativeButton={false}
              render={<Link href="/setup" />}
            >
              Start a rehearsal
            </Button>
            <a
              href="#how-it-works"
              className="text-[15px] font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-brand hover:text-brand"
            >
              How it works ↓
            </a>
          </div>
          <p className="mt-8 text-[13px] text-muted-foreground">
            Free. No account. Sessions stay in your browser.
          </p>
        </section>

        {/* Wave band */}
        <div className="border-y border-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
            <GradientWave className="h-20 w-full sm:h-24" />
          </div>
        </div>

        {/* How it works: index */}
        <section
          id="how-it-works"
          className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
        >
          <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            How a session runs
          </h2>
          <ol className="mt-10 grid border border-foreground max-sm:divide-y sm:grid-cols-3 sm:divide-x divide-foreground">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="flex flex-col bg-card p-6 transition-colors hover:bg-muted/50 sm:p-7"
              >
                <span
                  className={`flex size-11 items-center justify-center ${step.tile}`}
                >
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <span className="mt-auto pt-6 text-sm font-medium text-muted-foreground">
                  {step.meta}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Statement */}
        <section className="bg-wash-blue">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-wash-blue-fg sm:text-5xl">
              Synthetic rehearsal,
              <br />
              not synthetic research.
            </p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-wash-blue-fg/75">
              PersonaPilot does not generate findings, and its answers are not
              data. It exists to train the researcher, so the questions you
              bring to real participants are worth their time.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                className="h-12 px-7 text-[15px] hover:bg-brand"
                nativeButton={false}
                render={<Link href="/setup" />}
              >
                Start a rehearsal
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-9 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
          <p className="text-[13px] font-medium">
            PersonaPilot. A rehearsal tool for UX research.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Made at the University of Toronto.
          </p>
        </div>
      </footer>
    </>
  );
}
