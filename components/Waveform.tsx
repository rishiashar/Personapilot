import { cn } from "@/lib/utils";

// Three-bar mark used as the wordmark glyph.
export function VoiceMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("flex items-center gap-[2.5px] text-foreground", className)}
    >
      <span className="h-[7px] w-[2.5px] bg-current" />
      <span className="h-[14px] w-[2.5px] bg-current" />
      <span className="h-[10px] w-[2.5px] bg-current" />
    </span>
  );
}
