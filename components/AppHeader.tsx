import Link from "next/link";
import { RiCheckLine } from "@remixicon/react";

import { HeaderCta } from "@/components/landing/HeaderCta";
import { ThemeToggle } from "@/components/application/theme/theme-toggle";
import { VoiceMark } from "@/components/Waveform";
import { cx } from "@/utils/cx";

export type AppStep = "setup" | "interview" | "summary";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "interview", label: "Interview" },
  { id: "summary", label: "Summary" },
];

function StepIndicator({ current }: { current: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <ol aria-label="Rehearsal steps" className="hidden items-center sm:flex">
      {STEPS.map((step, index) => {
        const isActive = index === currentIndex;
        const isDone = index < currentIndex;
        return (
          <li key={step.id} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-2.5 h-px w-5 bg-separator-border" />
            )}
            <span
              aria-current={isActive ? "step" : undefined}
              className={cx(
                "flex items-center gap-2 text-body-2-medium transition-colors duration-150",
                isActive ? "text-text-primary" : "text-text-tertiary",
              )}
            >
              <span
                className={cx(
                  "flex size-5 items-center justify-center rounded-full text-caption-2-semibold tracking-normal",
                  isActive && "bg-accent-500 text-text-white",
                  isDone && "bg-accent-100 text-accent-700",
                  !isActive && !isDone && "bg-background-tertiary-default text-text-tertiary",
                )}
              >
                {isDone ? <RiCheckLine className="size-3" aria-hidden /> : index + 1}
              </span>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function AppHeader({
  step,
  mode = "Beta",
}: {
  step?: AppStep;
  mode?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-separator-border bg-background-full/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-2.5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2"
        >
          <VoiceMark />
          <span className="text-headline-semibold text-text-primary">ProbeRoom</span>
        </Link>

        <div className="flex items-center gap-4">
          {step ? <StepIndicator current={step} /> : <HeaderCta mode={mode} />}
          <ThemeToggle appearance="segmented" />
        </div>
      </div>
    </header>
  );
}
