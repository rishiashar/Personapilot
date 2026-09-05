import { RiArrowDownLine } from "@remixicon/react";

import { LinkButton } from "@/components/base/buttons/link-button";
import { AppFooter } from "@/components/AppFooter";
import { AppHeader } from "@/components/AppHeader";
import { Eyebrow } from "@/components/Eyebrow";
import { HeroDemo } from "@/components/landing/HeroDemo";
import { LiveAppFrame } from "@/components/landing/LiveAppFrame";
import { Reveal } from "@/components/landing/Reveal";
import { StoryBeats } from "@/components/landing/StoryBeats";
import { NavButton } from "@/components/NavButton";
import { Waveform } from "@/components/Waveform";
import { cx } from "@/utils/cx";

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
    tint: "bg-wash-blue",
    bullet: "bg-wash-blue-fg",
    mockup: (
      <LiveAppFrame
        src="/demo/setup"
        label="Setup, question guide"
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
    tint: "bg-wash-amber",
    bullet: "bg-wash-amber-fg",
    mockup: (
      <LiveAppFrame
        src="/demo/interview"
        label="Interview, live"
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
    tint: "bg-wash-green",
    bullet: "bg-wash-green-fg",
    mockup: (
      <LiveAppFrame
        src="/demo/summary"
        label="Summary, question by question"
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
          <Eyebrow className="animate-hero-line">For designers and UX researchers</Eyebrow>
          <h1 className="mt-5 max-w-4xl text-display-2-semibold text-balance text-text-primary sm:text-display-1-semibold xl:text-large-title-semibold">
            <span className="animate-hero-line inline-block">
              Practice your user interviews
            </span>{" "}
            <span className="animate-hero-line relative inline-block whitespace-nowrap text-accent-600 [animation-delay:140ms]">
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
                  className="animate-underline-draw [animation-delay:850ms]"
                />
              </svg>
            </span>
          </h1>
          <p className="animate-rise mt-6 max-w-2xl text-headline-regular text-text-secondary [animation-delay:320ms]">
            ProbeRoom gives you an AI research participant to interview out
            loud. Ask your questions, hear answers in a real voice, and find
            out which questions work before you sit down with a real user.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap items-center justify-center gap-5 [animation-delay:440ms]">
            <NavButton href="/setup">Start a rehearsal</NavButton>
            <LinkButton
              variant="secondary"
              href="#features"
              trailingIcon={RiArrowDownLine}
            >
              See how it works
            </LinkButton>
          </div>
          <HeroDemo className="animate-rise mt-14 w-full max-w-2xl text-left [animation-delay:560ms] sm:mt-16" />
        </section>

        {/* Feature cards */}
        <section id="features" className="scroll-mt-16 border-t border-separator-border">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="text-center">
              <Eyebrow>How it works</Eyebrow>
              <h2 className="mx-auto mt-3 max-w-2xl text-display-4-semibold text-balance text-text-primary sm:text-display-3-semibold">
                Set up, interview, get graded
              </h2>
            </Reveal>
            <div className="mt-12 space-y-8 sm:space-y-10">
              {FEATURES.map((feature) => (
                <Reveal key={feature.title}>
                  <article className="grid overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default transition-shadow duration-150 hover:shadow-lg lg:grid-cols-2">
                    <div
                      className={cx(
                        "flex flex-col justify-center p-7 sm:p-10",
                        feature.reverse && "lg:order-2",
                      )}
                    >
                      <h3 className="text-title-1-medium text-balance text-text-primary sm:text-display-4-semibold">
                        {feature.title}
                      </h3>
                      <p className="mt-4 max-w-md text-headline-regular text-text-secondary">
                        {feature.description}
                      </p>
                      <ul className="mt-6 space-y-2.5">
                        {feature.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-2.5 text-body-regular text-text-primary"
                          >
                            <span
                              aria-hidden
                              className={cx(
                                "mt-[7px] size-2 shrink-0 rounded-full",
                                feature.bullet,
                              )}
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className={cx(
                        "relative min-h-[320px] overflow-hidden border-separator-border max-lg:border-t sm:min-h-[420px] lg:border-l",
                        feature.tint,
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
        <section
          id="story"
          className="border-t border-separator-border bg-background-secondary-default"
        >
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <Reveal className="text-center">
              <Eyebrow>Why this exists</Eyebrow>
              <h2 className="mx-auto mt-3 max-w-3xl text-display-4-semibold text-balance text-text-primary sm:text-display-3-semibold">
                The questions were the problem
              </h2>
            </Reveal>
            <div className="mx-auto max-w-5xl">
              <StoryBeats className="mt-14 sm:mt-20" />
              <Reveal>
                <div className="mt-16 text-center sm:mt-24">
                  <Eyebrow>The lesson</Eyebrow>
                  <p className="mx-auto mt-4 max-w-2xl text-title-1-medium text-balance text-text-primary sm:text-display-3-semibold">
                    Better <span className="text-accent-600">questions</span> create
                    better conversations.
                  </p>
                  <p className="mx-auto mt-5 max-w-xl text-headline-regular text-text-secondary">
                    People have deeper stories to share. Our questions just fail
                    to open the right door. ProbeRoom is the practice space for
                    finding it before you are in the room with a real person.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-separator-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 py-20 text-center sm:px-8 sm:py-28">
            <Reveal className="flex w-full flex-col items-center">
              <Waveform count={42} maxHeight={26} className="w-full max-w-xs" />
              <Eyebrow className="mt-10">One last question</Eyebrow>
              <p className="mt-5 max-w-3xl text-display-4-semibold text-balance text-text-primary sm:text-display-2-semibold">
                Your next research interview
                <br />
                deserves a rehearsal.
              </p>
              <p className="mt-6 max-w-xl text-headline-regular text-text-secondary">
                ProbeRoom will not do your research for you. It makes sure
                that when you sit down with a real person, every question you
                ask is worth their time.
              </p>
              <div className="mt-10">
                <NavButton href="/setup">Start a rehearsal</NavButton>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <AppFooter />
    </>
  );
}
