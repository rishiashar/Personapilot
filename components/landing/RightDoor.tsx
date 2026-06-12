"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DOORS = ["Q1", "Q2", "Q3", "Q4", "Q5"];
const OPEN_INDEX = 3;

/**
 * The "right door" illustration: five doors, one for each question. When
 * scrolled into view they rise in one by one, then the right one swings
 * open and the voice inside starts speaking in brand blue.
 */
export function RightDoor({ className }: { className?: string }) {
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
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "flex items-end justify-center gap-4 select-none sm:gap-7",
        className,
      )}
    >
      {DOORS.map((label, i) => {
        const isOpen = i === OPEN_INDEX;
        return (
          <div
            key={label}
            className={cn(
              "flex flex-col items-center gap-2.5 transition-[opacity,transform] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              entered ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
            )}
            style={{ transitionDelay: `${i * 130}ms` }}
          >
            <div
              className={cn(
                "relative h-24 w-14 border-2 sm:h-32 sm:w-[74px]",
                isOpen ? "border-foreground" : "border-foreground/35",
              )}
              style={{ perspective: "260px" }}
            >
              {/* the voice inside */}
              <span className="absolute inset-0 flex items-center justify-center gap-[3px]">
                {[0.45, 1, 0.6].map((scale, j) => (
                  <span
                    key={j}
                    className={cn(
                      "w-[4px] rounded-full bg-brand sm:w-[5px]",
                      entered && isOpen && "animate-wavebar motion-reduce:animate-none",
                    )}
                    style={{
                      height: `${scale * 44}%`,
                      animationDelay: `${1300 + j * 180}ms`,
                      opacity: isOpen ? 1 : 0,
                    }}
                  />
                ))}
              </span>
              {/* the door panel */}
              <span
                className={cn(
                  "absolute inset-0 origin-left border-foreground bg-background transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  isOpen
                    ? "border-2 [transform-style:preserve-3d]"
                    : "border border-foreground/35 bg-muted/40",
                )}
                style={{
                  transform:
                    entered && isOpen ? "rotateY(-68deg)" : "rotateY(0deg)",
                  transitionDelay: isOpen ? "900ms" : undefined,
                }}
              >
                <span
                  className={cn(
                    "absolute top-1/2 right-1.5 size-1 -translate-y-1/2 rounded-full sm:right-2 sm:size-1.5",
                    isOpen ? "bg-foreground" : "bg-foreground/35",
                  )}
                />
              </span>
            </div>
            <span
              className={cn(
                "font-mono text-[11px] tracking-wide transition-colors duration-500",
                entered && isOpen
                  ? "text-brand"
                  : "text-muted-foreground/60",
              )}
              style={isOpen ? { transitionDelay: "1300ms" } : undefined}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
