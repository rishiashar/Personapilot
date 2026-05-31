import Link from "next/link";
import { Compass } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type AppStep = "setup" | "interview" | "summary";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "setup", label: "Setup" },
  { id: "interview", label: "Interview" },
  { id: "summary", label: "Summary" },
];

function StepIndicator({ current }: { current: AppStep }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);
  const progressValue = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="hidden min-w-[260px] flex-col gap-2 sm:flex">
      <ol className="flex items-center justify-between text-xs font-medium">
        {STEPS.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-1.5",
                isActive
                  ? "text-foreground"
                  : isDone
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border text-[11px] tabular-nums",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : isDone
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
      <Progress value={progressValue} aria-label="Rehearsal progress" />
    </div>
  );
}

export function AppHeader({
  step,
  mode = "MVP",
}: {
  step?: AppStep;
  mode?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Compass className="size-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-semibold tracking-tight">
              PersonaPilot
            </span>
            <span className="text-[11px] text-muted-foreground">
              Interview rehearsal
            </span>
          </span>
        </Link>

        {step ? (
          <StepIndicator current={step} />
        ) : (
          <Badge variant="secondary" className="font-normal">
            {mode}
          </Badge>
        )}
      </div>
    </header>
  );
}
