import { MessageSquareText } from "lucide-react";

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
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-border px-4 py-2">
        <h2 className="caps">Transcript</h2>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {researcherCount} {researcherCount === 1 ? "question" : "questions"}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <MessageSquareText className="size-6 text-muted-foreground/40" strokeWidth={1.5} aria-hidden />
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
                  <div key={message.id} className="animate-message-in px-4 py-3.5">
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
