import type { ComponentType } from "react";

import { NavButton } from "@/components/NavButton";
import { cx } from "@/utils/cx";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "ghost";
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  className,
}: {
  title: string;
  description?: string;
  icon?: IconComponent;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-center gap-5 rounded-3xl border border-border-button-default bg-background-primary-default px-6 py-14 text-center",
        className
      )}
    >
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-full bg-background-secondary-default text-foreground-icon-secondary">
          <Icon className="size-6" aria-hidden />
        </span>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-title-2-medium text-text-primary">{title}</h2>
        {description ? (
          <p className="mx-auto max-w-sm text-body-regular text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {primaryAction ? (
            <NavButton
              href={primaryAction.href}
              variant={primaryAction.variant ?? "primary"}
            >
              {primaryAction.label}
            </NavButton>
          ) : null}
          {secondaryAction ? (
            <NavButton
              href={secondaryAction.href}
              variant={secondaryAction.variant ?? "secondary"}
            >
              {secondaryAction.label}
            </NavButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
