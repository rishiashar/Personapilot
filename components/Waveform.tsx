import { cn } from "@/lib/utils";

// Deterministic bar heights so server and client render identically.
function barHeight(i: number, max: number) {
  return Math.round(
    0.28 * max +
      0.5 * max * Math.abs(Math.sin(i * 0.82)) +
      0.22 * max * Math.abs(Math.sin(i * 0.31))
  );
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
          className={cn("w-[2px] bg-current", animated && "animate-wavebar")}
          style={{
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
