import type { HTMLAttributes } from "react";
import { cx } from "@/utils/cx";

/** Small uppercase section label that sits above a heading or a panel. */
export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx(
        "text-caption-1-semibold tracking-[0.08em] text-text-secondary uppercase",
        className,
      )}
      {...props}
    />
  );
}
