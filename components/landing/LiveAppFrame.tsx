import { cn } from "@/lib/utils";

/**
 * Embeds a real app screen (one of the /demo/* routes) inside the landing
 * page's window chrome. The screen renders at full desktop width and is
 * scaled down. The whole window is meant to sit inset from the top-left of
 * its card panel and bleed off the panel's bottom-right edge, so the card
 * crops it like a screenshot peeking out.
 */
export function LiveAppFrame({
  src,
  label,
  frameWidth = 1280,
  frameHeight = 800,
  scale = 0.5,
  className,
}: {
  src: string;
  label: string;
  frameWidth?: number;
  frameHeight?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none border border-foreground bg-background text-left select-none",
        className,
      )}
      style={{ width: Math.round(frameWidth * scale) }}
    >
      <div className="flex items-center justify-between border-b border-foreground px-3 py-2">
        <span className="caps">{label}</span>
        <span className="flex gap-1">
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground" />
        </span>
      </div>
      <div
        className="relative overflow-hidden"
        style={{ height: Math.round(frameHeight * scale) }}
      >
        <iframe
          src={src}
          title={label}
          aria-hidden
          tabIndex={-1}
          loading="lazy"
          className="absolute top-0 left-0 origin-top-left border-0 bg-background"
          style={{
            width: frameWidth,
            height: frameHeight,
            transform: `scale(${scale})`,
          }}
        />
      </div>
    </div>
  );
}
