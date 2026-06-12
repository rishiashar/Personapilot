import Image from "next/image";
import Link from "next/link";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import {
  InterviewMockup,
  SetupMockup,
  SummaryMockup,
} from "@/components/landing/ScreenMockups";
import { Waveform } from "@/components/Waveform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Set up the study",
    description:
      "Define your research goal, build the participant persona, and paste or upload the questions you plan to ask.",
    meta: "2 min",
    icon: "/icons/research-setup.svg",
  },
  {
    title: "Run the interview",
    description:
      "Ask your questions out loud with your guide beside you. The persona answers in character, in a matched voice.",
    meta: "10-20 min",
    icon: "/icons/interview-microphone.svg",
  },
  {
    title: "Read the feedback",
    description:
      "Strong questions, weak questions, missed follow-ups, and suggested rewrites you can take into the next session.",
    meta: "Instant",
    icon: "/icons/read-feedback.svg",
  },
];

const FEATURES = [
  {
    tag: "01 · Setup",
    title: "Bring your script, or build one in minutes",
    description:
      "Set a research goal, shape the participant persona, and drop in your question guide. Drag a file onto the upload zone or pick from six ready-made sample studies when you just want to practice.",
    points: [
      "Drag and drop your interview script: txt, md, docx",
      "Six rotating sample studies with matched personas",
      "Personas with backgrounds, behaviours, and frustrations",
    ],
    gradient: "from-wash-blue via-background to-background",
    mockup: <SetupMockup className="w-full max-w-md" />,
  },
  {
    tag: "02 · Interview",
    title: "A live room that feels like the real thing",
    description:
      "Ask out loud and the persona answers in character, in a matched voice. Your question guide sits beside the conversation so you can check off ground as you cover it, with the full transcript building as you go.",
    points: [
      "Voice mode with speech in, persona voice out",
      "Question checklist with progress you can tick off",
      "Compact participant card, full profile one tap away",
    ],
    gradient: "from-wash-amber via-background to-background",
    mockup: <InterviewMockup className="w-full max-w-lg" />,
    reverse: true,
  },
  {
    tag: "03 · Feedback",
    title: "See what every question actually got you",
    description:
      "The summary maps each question to the kind of answer it produced: concrete story, factual detail, opinion, or a flat yes or no, and whether that serves your research goal. Weak phrasing gets a rewrite you can use next time.",
    points: [
      "Question by question answer analysis",
      "At-a-glance session verdict with a feedback mix bar",
      "Missed follow-ups and suggested rewrites",
    ],
    gradient: "from-wash-green via-background to-background",
    mockup: <SummaryMockup className="w-full max-w-lg" />,
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
              href="#features"
              className="text-[15px] font-medium underline-offset-4 hover:text-brand hover:underline"
            >
              See how it works
            </a>
          </div>
          <p className="mt-8 text-[13px] text-muted-foreground">
            Free. No account. Sessions stay in your browser.
          </p>
        </section>

        {/* Waveform band */}
        <div className="border-y border-foreground">
          <div className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8">
            <Waveform
              count={96}
              maxHeight={34}
              className="h-12 text-foreground"
            />
          </div>
        </div>

        {/* Feature cards */}
        <section
          id="features"
          className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24"
        >
          <p className="caps text-muted-foreground">What you get</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
            The whole loop, from script to feedback
          </h2>
          <div className="mt-12 space-y-10 sm:space-y-14">
            {FEATURES.map((feature) => (
              <article
                key={feature.tag}
                className="grid border border-foreground bg-card lg:grid-cols-2"
              >
                <div
                  className={cn(
                    "flex flex-col justify-center p-7 sm:p-10",
                    feature.reverse && "lg:order-2",
                  )}
                >
                  <p className="caps text-muted-foreground">{feature.tag}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
                    {feature.title}
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {feature.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-[14px] leading-snug"
                      >
                        <span
                          aria-hidden
                          className="mt-[5px] size-2 shrink-0 bg-brand"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  className={cn(
                    "flex items-center justify-center border-foreground bg-gradient-to-br p-7 max-lg:border-t sm:p-10 lg:border-l",
                    feature.gradient,
                    feature.reverse && "lg:order-1 lg:border-r lg:border-l-0",
                  )}
                >
                  {feature.mockup}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* How it works: index */}
        <section
          id="how-it-works"
          className="border-t border-foreground bg-muted/30"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
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
                    aria-hidden
                    className="flex size-20 items-center justify-center"
                  >
                    <Image
                      src={step.icon}
                      alt=""
                      width={80}
                      height={80}
                      className="size-20 object-contain"
                      unoptimized
                    />
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
          </div>
        </section>

        {/* Statement */}
        <section className="border-t border-foreground bg-wash-blue">
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

      <AppFooter />
    </>
  );
}
