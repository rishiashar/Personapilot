"use client";

import { useEffect, useRef } from "react";
import rough from "roughjs";

import { cn } from "@/lib/utils";

type Kind = "setup" | "interview" | "feedback";

const INK = {
  stroke: "currentColor",
  strokeWidth: 2,
  roughness: 1.5,
  bowing: 1.2,
};

/**
 * Small hand-sketched glyph for a How it works card, drawn with rough.js
 * in the same wobbly ink as the story scene: the script, the conversation,
 * the verdict.
 */
export function StepGlyph({ kind, className }: { kind: Kind; className?: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || svg.childNodes.length) return;
    const rc = rough.svg(svg);

    const blue = (node: SVGGElement) => {
      node.setAttribute("class", "text-brand");
      return node;
    };

    if (kind === "setup") {
      // the script: a page of questions with a big blue question mark
      svg.appendChild(rc.rectangle(8, 4, 38, 50, { ...INK, seed: 21 }));
      svg.appendChild(rc.line(15, 15, 39, 15, { ...INK, strokeWidth: 1.6, seed: 22 }));
      svg.appendChild(rc.line(15, 24, 33, 24, { ...INK, strokeWidth: 1.6, seed: 23 }));
      svg.appendChild(rc.line(15, 33, 36, 33, { ...INK, strokeWidth: 1.6, seed: 24 }));
      svg.appendChild(
        blue(
          rc.path("M41 28 C41 18, 59 18, 59 28 C59 36, 50 35, 50 42", {
            ...INK,
            strokeWidth: 2.6,
            seed: 25,
          }),
        ),
      );
      svg.appendChild(
        blue(rc.circle(50, 51, 3.5, { ...INK, strokeWidth: 2.4, seed: 26 })),
      );
    }

    if (kind === "interview") {
      // the conversation: a bubble with a living blue voice
      svg.appendChild(
        rc.path("M6 6 L58 6 L58 38 L30 38 L20 52 L19 38 L6 38 Z", {
          ...INK,
          seed: 31,
        }),
      );
      [
        { x: 18, h: 8 },
        { x: 26, h: 18 },
        { x: 34, h: 12 },
        { x: 42, h: 20 },
        { x: 50, h: 10 },
      ].forEach((bar, i) => {
        svg.appendChild(
          blue(
            rc.line(bar.x, 22 - bar.h / 2, bar.x, 22 + bar.h / 2, {
              ...INK,
              strokeWidth: 3,
              seed: 32 + i,
            }),
          ),
        );
      });
    }

    if (kind === "feedback") {
      // the verdict: graded lines, one circled in blue
      svg.appendChild(rc.line(8, 12, 36, 12, { ...INK, strokeWidth: 1.6, seed: 41 }));
      svg.appendChild(rc.path("M44 14 L48 18 L56 7", { ...INK, seed: 42 }));
      svg.appendChild(rc.line(8, 30, 32, 30, { ...INK, strokeWidth: 1.6, seed: 43 }));
      svg.appendChild(rc.line(44 , 32, 56, 25, { ...INK, seed: 44 }));
      svg.appendChild(rc.line(8, 48, 38, 48, { ...INK, strokeWidth: 1.6, seed: 45 }));
      svg.appendChild(
        blue(rc.ellipse(23, 48, 40, 16, { ...INK, strokeWidth: 2.2, seed: 46 })),
      );
    }
  }, [kind]);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox="0 0 64 58"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-12 w-[53px] text-foreground select-none", className)}
    />
  );
}
