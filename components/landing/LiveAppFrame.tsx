import { cn } from "@/lib/utils";

/**
 * Embeds a real app screen (one of the /demo/* routes) inside the landing
 * page's window chrome. The screen renders at full desktop width and is
 * scaled down, anchored to the bottom-right corner so wider screens crop
 * off the left edge like a screenshot peeking out of the card.
 */
export function LiveAppFrame({
  src,
  label,
  frameWidth = 1280,
  frameHeight = 800,
  scale = 0.42,
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
        "pointer-events-none w-full border border-foreground bg-background text-left shadow-[8px_8px_0_0_var(--foreground)] select-none",
        className,
      )}
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
          className="absolute right-0 bottom-0 origin-bottom-right border-0 bg-background"
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
