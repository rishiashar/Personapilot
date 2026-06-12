"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic } from "lucide-react";

import { cn } from "@/lib/utils";

const EXCHANGES = [
  {
    question: "Walk me through how dinner came together last night.",
    answer:
      "It was chaos, honestly. I got home late, the fridge was half empty, and I ended up improvising pasta so nobody had to do a second grocery run.",
    tag: "Concrete story",
    tone: "green" as const,
  },
  {
    question: "Thoughts on the app?",
    answer: "It is fine, I guess. Pretty easy to use overall.",
    tag: "Vague opinion",
    tone: "amber" as const,
  },
  {
    question: "When do you feel connected to UofT?",
    answer:
      "Honestly? During convocation season. The rest of the year it feels like a place I commute to, not a place I belong to.",
    tag: "Real insight",
    tone: "green" as const,
  },
];

const TONES = {
  green: "bg-wash-green text-wash-green-fg",
  amber: "bg-wash-amber text-wash-amber-fg",
} as const;

type Phase = "typing" | "thinking" | "answering" | "tagged";

const ENTER = "animate-hero-enter";

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function HeroDemo({ className }: { className?: string }) {
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [questionChars, setQuestionChars] = useState(0);
  const [answerChars, setAnswerChars] = useState(0);
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const exchange = EXCHANGES[exchangeIndex];

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible) return;
    const schedule = (fn: () => void, ms: number) => {
      timer.current = setTimeout(fn, ms);
    };

    if (phase === "typing") {
      if (questionChars < exchange.question.length) {
        schedule(() => setQuestionChars((c) => c + 1), 34);
      } else {
        schedule(() => setPhase("thinking"), 350);
      }
    } else if (phase === "thinking") {
      schedule(() => setPhase("answering"), 1100);
    } else if (phase === "answering") {
      if (answerChars < exchange.answer.length) {
        schedule(() => setAnswerChars((c) => c + 2), 18);
      } else {
        schedule(() => setPhase("tagged"), 250);
      }
    } else {
      schedule(() => {
        setExchangeIndex((i) => (i + 1) % EXCHANGES.length);
        setPhase("typing");
        setQuestionChars(0);
        setAnswerChars(0);
      }, 2600);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [phase, questionChars, answerChars, exchange, reducedMotion, visible]);

  const still = reducedMotion;
  const shownQuestion = still
    ? exchange.question
    : exchange.question.slice(0, questionChars);
  const shownAnswer = still
    ? exchange.answer
    : exchange.answer.slice(0, answerChars);
  const showAnswer = still || phase !== "typing";
  const showTag = still || phase === "tagged";
  const speaking = !still && (phase === "thinking" || phase === "answering");

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none border border-foreground bg-background text-left shadow-[8px_8px_0_0_var(--foreground)] select-none",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-foreground px-3 py-2">
        <span className="caps">Live rehearsal</span>
        <span className="flex gap-1">
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground" />
        </span>
      </div>
      <div className="flex min-h-[230px] flex-col gap-3 p-4 text-[13px]">
        <div className="flex justify-end">
          <div className="max-w-[85%] space-y-1.5 text-right">
            <span className="text-[10px] font-medium text-muted-foreground">
              You · Researcher
            </span>
            <p className="border border-foreground bg-foreground px-3 py-2 text-left text-background">
              {shownQuestion}
              {!still && phase === "typing" && (
                <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-background" />
              )}
            </p>
          </div>
        </div>
        {showAnswer && (
          <div className={cn("flex justify-start", !still && ENTER)}>
            <div className="max-w-[85%] space-y-1.5">
              <span className="flex items-center gap-1.5">
                <span className="flex size-4 items-center justify-center bg-brand text-[8px] font-semibold text-white">
                  D
                </span>
                <span className="text-[10px] font-medium text-muted-foreground">
                  Dario · Participant
                </span>
              </span>
              <p className="border border-border bg-muted/40 px-3 py-2">
                {!still && phase === "thinking" ? (
                  <span className="inline-flex gap-1">
                    <span className="size-1.5 animate-pulse bg-foreground/50" />
                    <span className="size-1.5 animate-pulse bg-foreground/50 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse bg-foreground/50 [animation-delay:300ms]" />
                  </span>
                ) : (
                  shownAnswer
                )}
              </p>
              {showTag && (
                <span
                  className={cn(
                    "inline-block px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] uppercase",
                    TONES[exchange.tone],
                    !still && ENTER,
                  )}
                >
                  {exchange.tag}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-foreground px-3 py-2.5">
        <span className="flex size-7 items-center justify-center bg-foreground text-background">
          <Mic className="size-3.5" />
        </span>
        <span className="flex h-6 flex-1 items-center gap-[3px] overflow-hidden">
          {Array.from({ length: 36 }, (_, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] bg-brand transition-transform duration-300",
                speaking && visible && "animate-wavebar",
              )}
              style={{
                height: 6 + Math.round(14 * Math.abs(Math.sin(i * 0.82))),
                animationDelay: `${(i % 12) * 90}ms`,
                transform: speaking ? undefined : "scaleY(0.3)",
              }}
            />
          ))}
        </span>
        <span className="caps text-muted-foreground">
          {speaking ? "Dario is speaking..." : "Listening"}
        </span>
      </div>
    </div>
  );
}
