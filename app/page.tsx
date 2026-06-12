import Link from "next/link";

import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { StoryBeats } from "@/components/landing/StoryBeats";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { LiveAppFrame } from "@/components/landing/LiveAppFrame";
import { Reveal } from "@/components/landing/Reveal";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/Waveform";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    title: "Bring your questions, or build a study in minutes",
    description:
      "Add your questions, drop in your script, or pick a ready-made study.",
    points: [
      "Drag and drop: txt, md, docx",
      "Six ready-made sample studies",
      "Participants with real backstories",
    ],
    gradient: "from-wash-blue via-background to-background",
    mockup: (
      <LiveAppFrame
        src="/demo/setup"
        label="Setup · Question guide"
        frameWidth={1100}
        frameHeight={780}
        scale={0.52}
        className="absolute top-8 left-8 sm:top-12 sm:left-12"
      />
    ),
  },
  {
    title: "Talk to a participant that talks back",
    description:
      "Ask out loud. The participant answers in character, in their own voice.",
    points: [
      "Speak questions, hear answers",
      "Tick off questions as you go",
      "Transcript builds itself",
    ],
    gradient: "from-wash-amber via-background to-background",
    mockup: (
      <LiveAppFrame
        src="/demo/interview"
        label="Interview · Live"
        frameWidth={1280}
        frameHeight={800}
        scale={0.5}
        className="absolute top-8 left-8 sm:top-12 sm:left-12"
      />
    ),
    reverse: true,
  },
  {
    title: "See what every question actually got you",
    description:
      "Every question is graded by the answer it got back. Weak ones get a rewrite.",
    points: [
      "Question-by-question grades",
      "One-look session verdict",
      "Ready-to-use rewrites",
    ],
    gradient: "from-wash-green via-background to-background",
    mockup: (
      <LiveAppFrame
        src="/demo/summary"
        label="Summary · Question by question"
        frameWidth={1280}
        frameHeight={900}
        scale={0.5}
        className="absolute top-8 left-8 sm:top-12 sm:left-12"
      />
    ),
  },
];

export default function HomePage() {
  return (
    <>
      <AppHeader mode="Beta" />
      <main className="flex-1">
        {/* Hero */}
        <section
          data-hero
          className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-16 pb-16 text-center sm:px-8 sm:pt-24 sm:pb-20"
        >
          <h1 className="animate-rise max-w-4xl text-5xl leading-[0.98] font-semibold tracking-[-0.03em] text-balance sm:text-6xl xl:text-7xl">
            Practice your user interviews{" "}
            <span className="relative inline-block whitespace-nowrap text-brand">
              before they count.
              <svg
                aria-hidden
                viewBox="0 0 230 12"
                preserveAspectRatio="none"
                className="absolute right-0 -bottom-2 left-0 h-[0.12em] w-full"
              >
                <path
                  d="M4 9 C 60 3, 160 2.5, 226 6.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  pathLength="1"
                  className="animate-underline-draw"
                />
              </svg>
            </span>
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground [animation-delay:120ms]">
            ProbeRoom gives you an AI participant to interview out loud. Ask
            your questions, hear answers in a real voice, and find out which
            questions work before you sit down with a real person.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-6 [animation-delay:220ms]">
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
          <HeroDemo className="animate-rise mt-14 w-full max-w-2xl text-left [animation-delay:340ms] sm:mt-16" />
        </section>

        {/* Feature cards */}
        <section id="features" className="border-t border-foreground">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <Reveal className="text-center">
            <p className="caps text-muted-foreground">How it works</p>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
              Set up, interview, get graded
            </h2>
          </Reveal>
          <div className="mt-12 space-y-10 sm:space-y-14">
            {FEATURES.map((feature) => (
              <Reveal key={feature.title}>
              <article className="grid border border-foreground bg-card transition-shadow duration-300 hover:shadow-[8px_8px_0_0_var(--foreground)] lg:grid-cols-2">
                <div
                  className={cn(
                    "flex flex-col justify-center p-7 sm:p-10",
                    feature.reverse && "lg:order-2",
                  )}
                >
                  <h3 className="text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">
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
                    "relative min-h-[320px] overflow-hidden border-foreground bg-gradient-to-br max-lg:border-t sm:min-h-[420px] lg:border-l",
                    feature.gradient,
                    feature.reverse && "lg:order-1 lg:border-r lg:border-l-0",
                  )}
                >
                  {feature.mockup}
                </div>
              </article>
              </Reveal>
            ))}
          </div>
          </div>
        </section>

        {/* Story */}
        <section id="story" className="border-t border-foreground bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="text-center">
              <p className="caps text-muted-foreground">Why this exists</p>
              <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                The questions were the problem
              </h2>
            </Reveal>
            <div className="mx-auto max-w-5xl">
              <StoryBeats className="mt-14 sm:mt-20" />
              <Reveal>
              <div className="mt-16 text-center sm:mt-24">
                <p className="caps text-muted-foreground">The lesson</p>
                <p className="mx-auto mt-4 max-w-2xl text-2xl leading-snug font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                  Better <span className="text-brand">questions</span> create
                  better conversations.
                </p>
                <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  People have deeper stories to share. Our questions just fail
                  to open the right door. ProbeRoom is the practice space for
                  finding it before you are in the room with a real person.
                </p>
                <p className="mt-8 text-[14px] font-medium">
                  Rishi Ashar
                  <span className="text-muted-foreground"> · Maker of ProbeRoom</span>
                </p>
              </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-foreground bg-foreground text-background">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
            <Reveal className="flex w-full flex-col items-center">
            <Waveform count={42} maxHeight={26} className="w-full max-w-xs" />
            <span className="caps mt-10 text-background/50">
              One last question
            </span>
            <p className="mt-5 max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance sm:text-5xl">
              Your next real interview
              <br />
              deserves a rehearsal.
            </p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-background/65">
              ProbeRoom will not do your research for you. It makes sure
              that when you sit down with a real person, every question you
              ask is worth their time.
            </p>
            <div className="mt-10">
              <Button
                size="lg"
                className="h-12 bg-background px-7 text-[15px] text-foreground hover:bg-brand hover:text-white"
                nativeButton={false}
                render={<Link href="/setup" />}
              >
                Start a rehearsal
              </Button>
            </div>
            </Reveal>
          </div>
        </section>
      </main>

      <AppFooter />
    </>
  );
}
