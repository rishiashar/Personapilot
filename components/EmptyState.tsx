import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 border border-border bg-card px-6 py-16 text-center",
        className
      )}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-balance">
          {title}
        </h2>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {primaryAction ? (
            <Button
              size="lg"
              className="hover:bg-brand"
              nativeButton={false}
              variant={primaryAction.variant ?? "default"}
              render={<Link href={primaryAction.href} />}
            >
              {primaryAction.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              size="lg"
              nativeButton={false}
              variant={secondaryAction.variant ?? "outline"}
              render={<Link href={secondaryAction.href} />}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
