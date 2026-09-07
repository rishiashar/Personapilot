import { cx } from "@/utils/cx";

const SPECTRUM_STOPS = 8;

// Deterministic bar heights so server and client render identically.
export function barHeight(i: number, max: number) {
  return Math.round(
    0.28 * max +
      0.5 * max * Math.abs(Math.sin(i * 0.82)) +
      0.22 * max * Math.abs(Math.sin(i * 0.31)),
  );
}

// Blends between neighbouring spectrum tokens so the bars sweep the pastel
// rainbow without any literal color leaving the stylesheet.
export function barColor(i: number, count: number) {
  const phase = i / Math.max(count - 1, 1);
  const scaled = phase * (SPECTRUM_STOPS - 1);
  const left = Math.floor(scaled) + 1;
  const right = Math.min(left + 1, SPECTRUM_STOPS);
  const mix = Math.round((scaled - Math.floor(scaled)) * 100);
  return `color-mix(in oklab, var(--color-spectrum-${left}) ${100 - mix}%, var(--color-spectrum-${right}))`;
}

export function Waveform({
  count = 64,
  maxHeight = 36,
  animated = true,
  className,
}: {
  count?: number;
  maxHeight?: number;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cx("flex items-center justify-between", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cx(
            "w-[3px] rounded-full bg-current",
            animated && "animate-wavebar",
          )}
          style={{
            color: barColor(i, count),
            height: barHeight(i, maxHeight),
            animationDelay: `${(i % 16) * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

// The ProbeRoom mark: voice bars flanking two door panels. Inside a `group`
// parent, hovering swings the doors open and pulses the bars in the accent.
export function VoiceMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="-22 0 733 557"
      className={cx("h-[18px] w-auto text-text-primary", className)}
      fill="currentColor"
    >
      <g className="transition-colors duration-150 group-hover:text-accent-500">
        <rect x="0" y="207" width="42" height="146" rx="21" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar" />
        <rect x="90" y="105" width="42" height="348" rx="21" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:180ms]" />
        <rect x="557" y="105" width="42" height="348" rx="21" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:360ms]" />
        <rect x="647" y="207" width="42" height="146" rx="21" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:540ms]" />
      </g>
      <g stroke="currentColor" strokeWidth="44" strokeLinejoin="round">
        <path
          d="M220 36 L288 87 L288 468 L220 519 Z"
          className="transition-transform duration-300 ease-out group-hover:-translate-x-[28px]"
        />
        <path
          d="M469 36 L401 87 L401 468 L469 519 Z"
          className="transition-transform duration-300 ease-out group-hover:translate-x-[28px]"
        />
      </g>
    </svg>
  );
}
