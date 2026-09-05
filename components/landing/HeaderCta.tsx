"use client";

import { useEffect, useState } from "react";

import { NavButton } from "@/components/NavButton";
import { cx } from "@/utils/cx";

/**
 * Right side of the landing header. Shows the mode label while the hero is
 * on screen, then swaps in the primary CTA once the visitor scrolls past it.
 */
export function HeaderCta({ mode }: { mode: string }) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.querySelector("[data-hero]");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <span className="relative flex h-9 items-center justify-end">
      <span
        className={cx(
          "text-body-2-medium text-text-secondary transition-all duration-300",
          pastHero && "pointer-events-none -translate-y-1 opacity-0",
        )}
        aria-hidden={pastHero}
      >
        {mode}
      </span>
      <span
        className={cx(
          "absolute right-0 transition-all duration-300",
          pastHero
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0",
        )}
        aria-hidden={!pastHero}
      >
        <NavButton href="/setup" size="small" tabIndex={pastHero ? 0 : -1}>
          Start a rehearsal
        </NavButton>
      </span>
    </span>
  );
}
