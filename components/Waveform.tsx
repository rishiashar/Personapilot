import { cn } from "@/lib/utils";

const PASTEL_SPECTRUM = [
  [255, 160, 180],
  [255, 194, 128],
  [255, 228, 124],
  [164, 226, 154],
  [128, 211, 247],
  [170, 180, 255],
  [211, 166, 255],
  [255, 162, 219],
] as const;

// Deterministic bar heights so server and client render identically.
export function barHeight(i: number, max: number) {
  return Math.round(
    0.28 * max +
      0.5 * max * Math.abs(Math.sin(i * 0.82)) +
      0.22 * max * Math.abs(Math.sin(i * 0.31))
  );
}

export function barColor(i: number, count: number) {
  const phase = i / Math.max(count - 1, 1);
  const scaled = phase * (PASTEL_SPECTRUM.length - 1);
  const leftIndex = Math.floor(scaled);
  const rightIndex = Math.min(leftIndex + 1, PASTEL_SPECTRUM.length - 1);
  const mix = scaled - leftIndex;
  const left = PASTEL_SPECTRUM[leftIndex];
  const right = PASTEL_SPECTRUM[rightIndex];
  const [r, g, b] = left.map((channel, channelIndex) =>
    Math.round(channel + (right[channelIndex] - channel) * mix)
  );
  return `rgb(${r} ${g} ${b})`;
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
      className={cn("flex items-center justify-between", className)}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn("w-[3px] bg-current", animated && "animate-wavebar")}
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

// The ProbeRoom mark: voice bars flanking two door panels.
// When rendered inside a `group` parent, hovering swings the door panels
// open and the voice bars pulse in brand blue.
export function VoiceMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="-22 0 733 557"
      className={cn("h-[18px] w-auto text-foreground", className)}
      fill="currentColor"
    >
      <g className="transition-colors duration-300 group-hover:text-brand">
        <rect x="0" y="207" width="42" height="146" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar" />
        <rect x="90" y="105" width="42" height="348" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:180ms]" />
        <rect x="557" y="105" width="42" height="348" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:360ms]" />
        <rect x="647" y="207" width="42" height="146" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:540ms]" />
      </g>
      <g fill="currentColor" stroke="currentColor" strokeWidth="44" strokeLinejoin="round">
        <path
          d="M220 36 L288 87 L288 468 L220 519 Z"
          className="transition-transform duration-500 ease-out group-hover:-translate-x-[28px]"
        />
        <path
          d="M469 36 L401 87 L401 468 L469 519 Z"
          className="transition-transform duration-500 ease-out group-hover:translate-x-[28px]"
        />
      </g>
    </svg>
  );
}
