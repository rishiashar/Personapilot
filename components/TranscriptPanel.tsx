import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { InterviewMessage } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export function TranscriptPanel({
  messages,
  personaName,
}: {
  messages: InterviewMessage[];
  personaName: string;
}) {
  const researcherCount = messages.filter((m) => m.role === "researcher").length;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-muted-foreground" />
            Live transcript
          </CardTitle>
          <Badge variant="secondary" className="font-normal tabular-nums">
            {researcherCount} {researcherCount === 1 ? "question" : "questions"}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="min-h-0 flex-1 p-0">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 py-10 text-center text-sm text-muted-foreground">
            The transcript will build here as you ask questions.
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="space-y-4 px-4 py-4">
              {messages.map((message) => {
                const isResearcher = message.role === "researcher";
                return (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={
                          isResearcher
                            ? "text-xs font-semibold text-primary"
                            : "text-xs font-semibold text-foreground"
                        }
                      >
                        {isResearcher ? "Researcher" : personaName}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {message.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
