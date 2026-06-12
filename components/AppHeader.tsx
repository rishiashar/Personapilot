import Link from "next/link";

import { VoiceMark } from "@/components/Waveform";
import { cn } from "@/lib/utils";

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
              <span aria-hidden className="mx-3 h-px w-5 bg-border" />
            )}
            <span
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "border-b-2 pb-0.5 text-[13px] font-medium transition-colors",
                isActive
                  ? "border-foreground text-foreground"
                  : isDone
                    ? "border-transparent text-foreground/60"
                    : "border-transparent text-muted-foreground/60"
              )}
            >
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
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <VoiceMark />
          <span className="text-[15px] font-semibold tracking-tight">
            PersonaPilot
          </span>
        </Link>

        {step ? (
          <StepIndicator current={step} />
        ) : (
          <span className="text-[13px] font-medium text-muted-foreground">
            {mode}
          </span>
        )}
      </div>
    </header>
  );
}
