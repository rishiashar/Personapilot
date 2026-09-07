import { RiChat3Line } from "@remixicon/react";

import { Badge } from "@/components/base/badges/badge";
import { Eyebrow } from "@/components/Eyebrow";
import type { InterviewMessage } from "@/lib/types";
import { formatTime } from "@/lib/utils";
import { cx } from "@/utils/cx";

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
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-12 items-center justify-between gap-2 border-b border-separator-border px-4">
        <Eyebrow>Transcript</Eyebrow>
        <Badge color="neutral">
          {researcherCount} {researcherCount === 1 ? "question" : "questions"}
        </Badge>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <RiChat3Line
              className="size-6 text-foreground-icon-tertiary"
              aria-hidden
            />
            <p className="max-w-[26ch] text-body-regular text-text-secondary">
              The transcript builds here as you ask questions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-separator-border">
            {messages.map((message) => {
              const isResearcher = message.role === "researcher";
              return (
                <div
                  key={message.id}
                  className="animate-message-in px-4 py-3.5"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={cx(
                        "truncate text-caption-1-semibold",
                        isResearcher
                          ? "text-text-secondary"
                          : "text-accent-600"
                      )}
                    >
                      {isResearcher ? "Researcher" : personaName}
                    </span>
                    <span className="font-mono text-caption-2-medium tabular-nums text-text-tertiary">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-body-regular text-text-primary">
                    {message.text}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
