"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

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

function Highlight({
  children,
  entered,
  delay,
}: {
  children: React.ReactNode;
  entered: boolean;
  delay: number;
}) {
  return (
    <span
      className="px-0.5 text-foreground transition-[background-size] duration-700 ease-out"
      style={{
        backgroundImage:
          "linear-gradient(var(--color-wash-blue), var(--color-wash-blue))",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 0",
        backgroundSize: entered ? "100% 100%" : "0% 100%",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </span>
  );
}

/**
 * The rewrite moment from the story, staged like it happened: the script
 * question gets struck out, the better one gets written over it, and the
 * answer opens up. Each beat plays in sequence when scrolled into view.
 */
export function RewriteMoment({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const reducedMotion = useReducedMotion();
  const entered = inView || reducedMotion;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const beat = (delay: number) =>
    ({
      className: cn(
        "transition-[opacity,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
        entered ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      ),
      style: { transitionDelay: `${delay}ms` },
    }) as const;

  return (
    <div ref={ref} aria-hidden className={cn("select-none", className)}>
      <div className="border-l-2 border-foreground/15 pl-6 sm:pl-9">
        {/* Beat 1: the script question, struck out */}
        <div {...beat(0)}>
          <p className="caps text-muted-foreground">
            Interview script · Question 4
          </p>
          <p className="relative mt-3 inline-block font-mono text-[15px] text-muted-foreground sm:text-base">
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
                    "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1) 600ms",
                }}
              />
            </svg>
          </p>
          <p
            className={cn(
              "mt-2 text-[13px] text-muted-foreground/70 transition-opacity duration-500",
              entered ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDelay: "900ms" }}
          >
            got back: &ldquo;Mostly the library page.&rdquo; Nothing to act
            on.
          </p>
        </div>

        {/* Beat 2: the rewrite */}
        <div {...beat(1300)} className={cn(beat(1300).className, "mt-9")}>
          <p className="caps text-brand">Rewritten mid-study</p>
          <p className="mt-3 max-w-xl text-2xl leading-snug font-semibold tracking-[-0.02em] text-balance sm:text-[32px]">
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
                      "stroke-dashoffset 600ms cubic-bezier(0.22,1,0.36,1) 1900ms",
                  }}
                />
              </svg>
            </span>{" "}
            to UofT?
          </p>
        </div>

        {/* Beat 3: the answer opens up */}
        <div {...beat(2300)} className={cn(beat(2300).className, "mt-7")}>
          <p className="max-w-xl text-[17px] leading-relaxed sm:text-lg">
            &ldquo;Honestly?{" "}
            <Highlight entered={entered} delay={2900}>
              During convocation season.
            </Highlight>{" "}
            The rest of the year it feels like{" "}
            <Highlight entered={entered} delay={3300}>
              a place I commute to, not a place I belong to
            </Highlight>
            .&rdquo;
          </p>
        </div>
      </div>

      <p
        className={cn(
          "caps mt-9 text-muted-foreground transition-opacity duration-700",
          entered ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDelay: "3900ms" }}
      >
        Same participant, same study. Only the question changed.
      </p>
    </div>
  );
}
