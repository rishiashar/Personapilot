import type { ReactNode } from "react";
import { Chip } from "@/components/base/badges/chip";
import { cx } from "@/utils/cx";

export type TagTone = "neutral" | "ink" | "green" | "yellow" | "red" | "blue";

// Product-level judgement tones mapped onto BoardUI's status chip colors.
const CHIP_COLOR = {
  neutral: "soft",
  ink: "gray",
  green: "lime",
  yellow: "yellow",
  red: "rose",
  blue: "blue",
} as const;

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
    <Chip
      variant="caption"
      color={CHIP_COLOR[tone]}
      className={cx("shrink-0 gap-1.5", className)}
    >
      {children}
    </Chip>
  );
}
