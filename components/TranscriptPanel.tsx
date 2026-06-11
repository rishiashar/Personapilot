import { ScrollArea } from "@/components/ui/scroll-area";
import type { InterviewMessage } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";

export function TranscriptPanel({
  messages,
  personaName,
}: {
  messages: InterviewMessage[];
  personaName: string;
}) {
  const researcherCount = messages.filter(
    (m) => m.role === "researcher"
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex items-baseline justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="caps">Transcript</h2>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {researcherCount} {researcherCount === 1 ? "question" : "questions"}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-10 text-center">
            <p className="max-w-[26ch] text-sm leading-relaxed text-muted-foreground">
              The transcript builds here as you ask questions.
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="divide-y divide-border">
              {messages.map((message) => {
                const isResearcher = message.role === "researcher";
                return (
                  <div key={message.id} className="px-4 py-3.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-xs font-semibold",
                          isResearcher ? "text-muted-foreground" : "text-brand"
                        )}
                      >
                        {isResearcher ? "Researcher" : personaName}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground/70">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
