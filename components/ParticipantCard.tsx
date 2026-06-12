"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Tag } from "@/components/Tag";
import type { Persona } from "@/lib/types";
import { cn, getInitials } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm leading-relaxed">{value || "Not provided"}</p>
    </div>
  );
}

function PersonaDetails({ persona }: { persona: Persona }) {
  return (
    <div className="space-y-3">
      <DetailRow label="Background" value={persona.background} />
      <DetailRow label="Behaviours" value={persona.behaviours} />
      <DetailRow label="Goals" value={persona.goals} />
      <DetailRow label="Frustrations" value={persona.frustrations} />
      <DetailRow label="Voice style" value={persona.voiceStyle} />
      {persona.voiceId && (
        <div className="space-y-1 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">Voice</p>
          <p className="text-sm leading-relaxed">
            {persona.voiceSource === "elevenlabs_search"
              ? "Auto-selected"
              : "Default voice"}
            {persona.voiceName ? ` · ${persona.voiceName}` : ""}
          </p>
          {persona.voiceSelectionReason && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {persona.voiceSelectionReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Plain panel: parents decide whether it gets an outer border. When
// `collapsible`, the full profile sits behind a toggle so dense layouts
// (like the interview rail) only show the identity row by default.
export function ParticipantCard({
  persona,
  className,
  collapsible = false,
}: {
  persona: Persona;
  className?: string;
  collapsible?: boolean;
}) {
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <div className={cn("bg-card p-4", className)}>
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center bg-foreground text-[13px] font-semibold text-background">
          {getInitials(persona.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-tight">
            {persona.name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {persona.role}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-3 pb-4">
        <Tag tone="blue">Simulated</Tag>
        {persona.ageRange ? <Tag>{persona.ageRange}</Tag> : null}
      </div>
      {expanded && <PersonaDetails persona={persona} />}
      {collapsible && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className={cn(
            "flex w-full items-center justify-between gap-2 border-t border-border pt-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
            expanded && "mt-3"
          )}
        >
          {expanded ? "Hide full profile" : "Full profile"}
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
}
