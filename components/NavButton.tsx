import Link from "next/link";
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";
import { buttonStyles } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface NavButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> {
  href: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "medium" | "small" | "xs";
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children: ReactNode;
}

/** A Next.js `Link` wearing the BoardUI Button styles, for in-app navigation. */
export function NavButton({
  href,
  variant = "primary",
  size = "medium",
  leadingIcon: Leading,
  trailingIcon: Trailing,
  className,
  children,
  ...props
}: NavButtonProps) {
  return (
    <Link
      href={href}
      className={cx(
        buttonStyles.base,
        buttonStyles.size[size],
        buttonStyles.variant[variant],
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={buttonStyles.icon[size]} aria-hidden /> : null}
      <span className={buttonStyles.label[size]}>{children}</span>
      {Trailing ? <Trailing className={buttonStyles.icon[size]} aria-hidden /> : null}
    </Link>
  );
}
