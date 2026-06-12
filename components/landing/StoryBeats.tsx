"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function useEntered(threshold = 0.35) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEntered(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, entered };
}

function DepthMeter({
  entered,
  value,
  label,
  blue,
  delay = 0,
}: {
  entered: boolean;
  value: number;
  label: string;
  blue?: boolean;
  delay?: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="caps shrink-0 text-[9px] text-muted-foreground">
        {label}
      </span>
      <span className="h-[6px] flex-1 bg-foreground/10">
        <span
          className={cn("block h-full", blue ? "bg-brand" : "bg-foreground/35")}
          style={{
            width: entered ? `${value}%` : "0%",
            transition: "width 900ms cubic-bezier(0.22,1,0.36,1)",
            transitionDelay: `${delay}ms`,
          }}
        />
      </span>
      <span
        className={cn(
          "shrink-0 font-mono text-[11px] tabular-nums transition-opacity duration-500",
          blue ? "text-brand" : "text-muted-foreground",
          entered ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDelay: `${delay + 600}ms` }}
      >
        {value}%
      </span>
    </div>
  );
}

function Artifact({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "border border-foreground bg-background p-5 shadow-[6px_6px_0_0_var(--foreground)] select-none sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Beat 1: the script and the flat answers it earned. */
function ScriptArtifact({ entered }: { entered: boolean }) {
  const questions = [
    "Which links do you open in the app?",
    "How often do you use it?",
    "What tasks are you trying to finish?",
  ];
  return (
    <Artifact>
      <p className="caps text-muted-foreground">Interview script · Week 2</p>
      <ul className="mt-4 space-y-3">
        {questions.map((q, i) => (
          <li
            key={q}
            className={cn(
              "font-mono text-[12px] text-foreground/75 transition-[opacity,transform] duration-500 sm:text-[13px]",
              entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
            style={{ transitionDelay: `${200 + i * 160}ms` }}
          >
            {q}
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-foreground/15 pt-4">
        <DepthMeter
          entered={entered}
          value={18}
          label="Answer depth"
          delay={800}
        />
      </div>
    </Artifact>
  );
}

/** Beat 2: the question struck out and rewritten. */
function RewriteArtifact({ entered }: { entered: boolean }) {
  return (
    <Artifact>
      <p className="caps text-muted-foreground">Question 4 · The rewrite</p>
      <p className="relative mt-4 inline-block font-mono text-[12px] text-muted-foreground sm:text-[13px]">
        Which links do you open in the app?
        <svg
          viewBox="0 0 300 20"
          preserveAspectRatio="none"
          className="absolute inset-y-0 right-0 left-0 my-auto h-[0.6em] w-full text-foreground/70"
        >
          <path
            d="M2 13 C 50 7, 95 16, 150 10 S 260 14, 298 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={entered ? 0 : 1}
            style={{
              transition:
                "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1) 400ms",
            }}
          />
        </svg>
      </p>
      <p
        className={cn(
          "mt-4 text-xl leading-snug font-semibold tracking-[-0.02em] transition-[opacity,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:text-[22px]",
          entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        )}
        style={{ transitionDelay: "900ms" }}
      >
        When do you feel{" "}
        <span className="relative inline-block whitespace-nowrap text-brand">
          connected
          <svg
            viewBox="0 0 230 12"
            preserveAspectRatio="none"
            className="absolute right-0 -bottom-1 left-0 h-[0.12em] w-full"
          >
            <path
              d="M4 9 C 60 3, 160 2.5, 226 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={entered ? 0 : 1}
              style={{
                transition:
                  "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1) 1400ms",
              }}
            />
          </svg>
        </span>{" "}
        to UofT?
      </p>
    </Artifact>
  );
}

/** Beat 3: the answer opens up. */
function InsightArtifact({ entered }: { entered: boolean }) {
  const highlight = (delay: number) =>
    ({
      backgroundImage:
        "linear-gradient(var(--color-wash-blue), var(--color-wash-blue))",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "0 0",
      backgroundSize: entered ? "100% 100%" : "0% 100%",
      transition: "background-size 700ms ease-out",
      transitionDelay: `${delay}ms`,
    }) as const;

  return (
    <Artifact>
      <p className="caps text-muted-foreground">Same participant · Take two</p>
      <p className="mt-4 text-[15px] leading-relaxed sm:text-base">
        &ldquo;Honestly?{" "}
        <span className="px-0.5" style={highlight(300)}>
          During convocation season.
        </span>{" "}
        The rest of the year it feels like{" "}
        <span className="px-0.5" style={highlight(700)}>
          a place I commute to, not a place I belong to
        </span>
        .&rdquo;
      </p>
      <div className="mt-5 border-t border-foreground/15 pt-4">
        <DepthMeter
          entered={entered}
          value={92}
          label="Answer depth"
          blue
          delay={1100}
        />
      </div>
    </Artifact>
  );
}

const BEATS = [
  {
    label: "The script",
    visual: ScriptArtifact,
    text: (
      <>
        During my capstone project at the University of Toronto, my team was
        researching why students were not using UofT Mobile, an app that put
        the university&apos;s links and tools in one place. We asked the
        obvious questions. Which links do you open? How often? What tasks are
        you trying to finish?
      </>
    ),
  },
  {
    label: "The rewrite",
    visual: RewriteArtifact,
    text: (
      <>
        The answers were fine. They were also stuck at the surface. They told
        us how students used the app, but never why they would come back to
        it. So we changed the questions. Instead of asking about links, we
        asked: what does UofT mean to you? When do you feel connected to it?
        Do you feel like you belong here?
      </>
    ),
  },
  {
    label: "The shift",
    visual: InsightArtifact,
    text: (
      <>
        The whole conversation changed. Tasks became feelings, app usage
        became student identity, and suddenly we were learning things worth
        acting on. Same study, same students. Only the questions were
        different.
      </>
    ),
  },
];

function Beat({
  index,
  label,
  text,
  visual: Visual,
}: {
  index: number;
  label: string;
  text: React.ReactNode;
  visual: (props: { entered: boolean }) => React.ReactNode;
}) {
  const { ref, entered } = useEntered();
  const reversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={cn(
        "grid items-center gap-8 transition-[opacity,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] sm:grid-cols-2 sm:gap-12",
        entered ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      )}
    >
      <div className={cn(reversed && "sm:order-2")}>
        <p className="caps text-brand">
          <span className="mr-2 font-mono text-muted-foreground">
            0{index + 1}
          </span>
          {label}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
          {text}
        </p>
      </div>
      <div className={cn(reversed && "sm:order-1")}>
        <Visual entered={entered} />
      </div>
    </div>
  );
}

/**
 * The origin story told in three beats, each paragraph paired with the
 * artifact it describes: the script, the rewrite, and the answer that
 * opened up.
 */
export function StoryBeats({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-14 sm:space-y-20", className)}>
      {BEATS.map((beat, i) => (
        <Beat
          key={beat.label}
          index={i}
          label={beat.label}
          text={beat.text}
          visual={beat.visual}
        />
      ))}
    </div>
  );
}
