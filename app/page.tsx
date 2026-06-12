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

const FEATURES = [
  {
    tag: "01 · Setup",
    title: "Bring your questions, or build a study in minutes",
    description:
      "Write down what you want to learn, describe the person you would interview, and add your questions. Drag in a file with your script, or pick one of six ready-made sample studies and start right away.",
    points: [
      "Drag and drop your interview script: txt, md, docx",
      "Six sample studies with matching participants",
      "Participants with real backgrounds, habits, and frustrations",
    ],
    gradient: "from-wash-blue via-background to-background",
    mockup: <SetupMockup className="w-full max-w-md" />,
  },
  {
    tag: "02 · Interview",
    title: "Talk to a participant that talks back",
    description:
      "Ask your questions out loud and the participant answers in character, in their own voice. Your question list sits beside the conversation so you can tick off ground as you cover it, and the transcript builds as you go.",
    points: [
      "Speak your questions, hear spoken answers",
      "Tick off questions as you cover them",
      "Participant details one tap away, never in your way",
    ],
    gradient: "from-wash-amber via-background to-background",
    mockup: <InterviewMockup className="w-full max-w-lg" />,
    reverse: true,
  },
  {
    tag: "03 · Feedback",
    title: "See what every question actually got you",
    description:
      "After the interview, every question you asked is graded by what it got back: a real story, a useful fact, just an opinion, or a flat yes or no. Weak questions get a better version you can use next time.",
    points: [
      "Every question mapped to the answer it produced",
      "One-look session verdict: strong, mixed, or needs work",
      "Missed follow-ups and ready-to-use rewrites",
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
            Practice your user interviews before they count.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            PersonaPilot gives you an AI participant to interview out loud. Ask
            your questions, hear answers in a real voice, and find out which
            questions work before you sit down with a real person.
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
          <p className="caps text-muted-foreground">How it works</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
            Set up, interview, get graded
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

        {/* Story */}
        <section id="story" className="border-t border-foreground bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <div className="max-w-3xl">
              <p className="caps text-muted-foreground">Why this exists</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-balance sm:text-4xl">
                Built after an interview that went nowhere
              </h2>
              <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-muted-foreground">
                <p>
                  I walked out of my first real user interview with thirty
                  minutes of recording and almost nothing I could use. The
                  participant was generous with their time. My questions were
                  not generous back: too vague, too leading, too easy to answer
                  with a shrug.
                </p>
                <p>
                  Nobody lets you practice this. You prepare a script, you get
                  one shot with a real person, and you only find out your
                  questions were weak after you have already spent their time.
                </p>
                <p>
                  So I built the practice room I wanted: a participant you can
                  interview as many times as you need, and feedback that tells
                  you exactly which questions earned real answers and which
                  ones wasted the minute.
                </p>
              </div>
              <p className="mt-8 text-[14px] font-medium">
                Rishi Ashar
                <span className="text-muted-foreground"> · Maker of PersonaPilot</span>
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-foreground bg-wash-blue">
          <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
            <p className="max-w-3xl text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-wash-blue-fg sm:text-5xl">
              Your next real interview
              <br />
              deserves a rehearsal.
            </p>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-wash-blue-fg/75">
              PersonaPilot will not do your research for you. It makes sure
              that when you sit down with a real person, every question you
              ask is worth their time.
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
