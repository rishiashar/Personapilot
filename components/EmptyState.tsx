import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
        <div className="space-y-1.5">
          <h2 className="font-heading text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {primaryAction ? (
              <Button
                size="lg"
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
      </CardContent>
    </Card>
  );
}
