import { Eyebrow } from "@/components/Eyebrow";
import { cx } from "@/utils/cx";

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
      className={cx(
        "pointer-events-none overflow-hidden rounded-2xl border border-border-button-default bg-background-primary-default text-left shadow-lg select-none",
        className,
      )}
      style={{ width: Math.round(frameWidth * scale) }}
    >
      <div className="flex items-center justify-between border-b border-separator-border px-3 py-2">
        <Eyebrow>{label}</Eyebrow>
        <span className="flex gap-1">
          <span className="size-1.5 rounded-full bg-background-quaternary-default" />
          <span className="size-1.5 rounded-full bg-background-quaternary-default" />
          <span className="size-1.5 rounded-full bg-accent-500" />
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
          className="absolute top-0 left-0 origin-top-left border-0 bg-background-full"
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
