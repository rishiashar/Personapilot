import Link from "next/link";

import { AppHeader } from "@/components/AppHeader";
import { Waveform } from "@/components/Waveform";
import { Button } from "@/components/ui/button";

const STEPS = [
  {
    title: "Set up the study",
    description:
      "Define your research goal and build the participant persona. A sample persona is included if you want to try it first.",
    meta: "2 min",
  },
  {
    title: "Run the interview",
    description:
      "Ask your questions out loud. The persona answers in character, in a voice matched to its profile, and the transcript builds live.",
    meta: "10–20 min",
  },
  {
    title: "Read the feedback",
    description:
      "Strong questions, weak questions, missed follow-ups, and suggested rewrites you can take into the next session.",
    meta: "Instant",
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

        {/* Waveform band */}
        <div className="border-y border-foreground">
          <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8">
            <Waveform count={96} maxHeight={34} className="h-12 text-foreground" />
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
          <ol className="mt-10">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="grid grid-cols-[40px_minmax(0,1fr)] gap-y-2 border-t border-foreground py-7 sm:grid-cols-[64px_300px_minmax(0,1fr)_96px] sm:gap-x-6 sm:py-8"
              >
                <span
                  aria-hidden
                  className="text-2xl font-semibold tracking-tight text-muted-foreground/40"
                >
                  {index + 1}
                </span>
                <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {step.title}
                </h3>
                <p className="col-start-2 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:col-start-3 sm:pt-1">
                  {step.description}
                </p>
                <span className="col-start-2 text-sm text-muted-foreground sm:col-start-4 sm:pt-1.5 sm:text-right">
                  {step.meta}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Statement */}
        <section className="bg-muted">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
              Synthetic rehearsal,
              <br />
              not synthetic research.
            </p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
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
