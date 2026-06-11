import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TagTone = "neutral" | "ink" | "green" | "yellow" | "red" | "blue";

// Square chips. Solid = state of record, outline = descriptive.
const TONES: Record<TagTone, string> = {
  neutral: "border border-border bg-card text-muted-foreground",
  ink: "bg-foreground text-background",
  green: "bg-brand text-brand-foreground",
  yellow: "border border-border bg-muted text-foreground",
  red: "bg-destructive text-white",
  blue: "border border-brand/35 bg-card text-brand",
};

export function Tag({
  tone = "neutral",
  className,
  children,
}: {
  tone?: TagTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1.5 px-2 text-[10px] leading-none font-semibold tracking-[0.06em] whitespace-nowrap uppercase",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
