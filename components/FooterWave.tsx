"use client";

import { useState } from "react";

import { barColor, barHeight } from "@/components/Waveform";

const COUNT = 110;
const MAX_HEIGHT = 38;
const REST_SCALE = 0.5;
const SIGMA = 0.055;

/**
 * Full-width pastel waveform that lives in the footer. The bars rise toward
 * the cursor as it moves across the band, like the wave is listening.
 */
export function FooterWave() {
  const [cursor, setCursor] = useState<number | null>(null);

  return (
    <div
      aria-hidden
      className="flex h-16 items-end justify-between gap-px overflow-hidden px-5 pb-2 sm:px-8"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCursor((e.clientX - rect.left) / rect.width);
      }}
      onMouseLeave={() => setCursor(null)}
    >
      {Array.from({ length: COUNT }, (_, i) => {
        const position = i / (COUNT - 1);
        const boost =
          cursor === null
            ? 0
            : Math.exp(-((position - cursor) ** 2) / (2 * SIGMA * SIGMA));
        return (
          <span
            key={i}
            className="w-[3px] origin-bottom transition-transform duration-200 ease-out motion-reduce:transition-none"
            style={{
              backgroundColor: barColor(i, COUNT),
              height: barHeight(i, MAX_HEIGHT),
              transform: `scaleY(${REST_SCALE + (1 - REST_SCALE) * boost})`,
            }}
          />
        );
      })}
    </div>
  );
}
