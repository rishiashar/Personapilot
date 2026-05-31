"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { InterviewMessage } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

function MessageBubble({
  message,
  personaInitials,
}: {
  message: InterviewMessage;
  personaInitials: string;
}) {
  const isResearcher = message.role === "researcher";

  return (
    <div
      className={cn(
        "flex items-end gap-2.5",
        isResearcher ? "justify-end" : "justify-start"
      )}
    >
      {!isResearcher && (
        <Avatar size="sm" className="bg-primary/10">
          <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
            {personaInitials}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isResearcher
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground"
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

export function InterviewChat({
  messages,
  personaName,
  isTyping,
  disabled,
  onSend,
}: {
  messages: InterviewMessage[];
  personaName: string;
  isTyping: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const personaInitials = getInitials(personaName);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, isTyping]);

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 px-4 py-5 sm:px-6">
          {messages.length === 0 && !isTyping ? (
            <div className="mx-auto max-w-md rounded-xl border border-dashed border-border bg-muted/30 px-5 py-6 text-center text-sm text-muted-foreground">
              Ask your first interview question below. The participant will
              respond in character so you can rehearse your phrasing.
            </div>
          ) : null}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              personaInitials={personaInitials}
            />
          ))}

          {isTyping ? (
            <div className="flex items-end gap-2.5">
              <Avatar size="sm" className="bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                  {personaInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.2s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.1s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border bg-card/60 p-3 sm:p-4">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Input
            value={draft}
            disabled={disabled}
            placeholder={
              disabled
                ? "This session has ended."
                : "Type an interview question…"
            }
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Interview question"
          />
          <Button
            type="submit"
            size="lg"
            disabled={disabled || draft.trim().length === 0}
          >
            <SendHorizonal />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
