import { cn } from "@/lib/utils";

type Kind = "setup" | "interview" | "feedback";

/**
 * Step tags built from the product's own chrome: the setup wizard's
 * progress bar, the interview room's live chip, the summary's verdict tag.
 */
export function StepTag({
  kind,
  children,
}: {
  kind: Kind;
  children: React.ReactNode;
}) {
  if (kind === "setup") {
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="relative h-2 w-16 border border-foreground"
        >
          <span className="absolute inset-y-0 left-0 w-1/3 bg-brand" />
        </span>
        <span className="caps text-muted-foreground">{children}</span>
      </div>
    );
  }

  if (kind === "interview") {
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex items-center gap-1.5 border border-foreground px-2 py-1"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping bg-brand opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 bg-brand" />
          </span>
          <span className="caps text-foreground">Live</span>
        </span>
        <span className="caps text-muted-foreground">{children}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className={cn(
          "caps border border-foreground bg-wash-green px-2 py-1 text-foreground",
        )}
      >
        Strong
      </span>
      <span className="caps text-muted-foreground">{children}</span>
    </div>
  );
}
