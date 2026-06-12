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
function barHeight(i: number, max: number) {
  return Math.round(
    0.28 * max +
      0.5 * max * Math.abs(Math.sin(i * 0.82)) +
      0.22 * max * Math.abs(Math.sin(i * 0.31))
  );
}

function barColor(i: number, count: number) {
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

// Three-bar mark used as the wordmark glyph.
export function VoiceMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex items-center gap-[2.5px] text-foreground", className)}
    >
      <span className="h-[7px] w-[2.5px] bg-current" />
      <span className="h-[14px] w-[2.5px] bg-current" />
      <span className="h-[10px] w-[2.5px] bg-current" />
    </span>
  );
}
