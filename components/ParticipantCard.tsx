"use client";

import { useState } from "react";
import { RiArrowDownSLine } from "@remixicon/react";

import { Avatar } from "@/components/base/avatar/avatar";
import { LinkButton } from "@/components/base/buttons/link-button";
import { Tag } from "@/components/Tag";
import type { Persona } from "@/lib/types";
import { getInitials } from "@/lib/utils";
import { cx } from "@/utils/cx";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-t border-separator-border pt-3">
      <p className="text-caption-1-medium text-text-tertiary">{label}</p>
      <p className="text-body-regular text-text-primary">
        {value || "Not provided"}
      </p>
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
        <div className="space-y-1 border-t border-separator-border pt-3">
          <p className="text-caption-1-medium text-text-tertiary">Voice</p>
          <p className="text-body-regular text-text-primary">
            {persona.voiceSource === "elevenlabs_search"
              ? "Auto-selected"
              : "Default voice"}
            {persona.voiceName ? ` · ${persona.voiceName}` : ""}
          </p>
          {persona.voiceSelectionReason && (
            <p className="text-caption-1-medium text-text-tertiary">
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
    <div className={cx("rounded-2xl p-4", className)}>
      <div className="flex items-center gap-3">
        <Avatar size="lg" color="blue" initials={getInitials(persona.name)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-headline-medium text-text-primary">
            {persona.name}
          </p>
          <p className="truncate text-body-2-medium text-text-secondary">
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
        <div
          className={cx(
            "border-t border-separator-border pt-3",
            expanded && "mt-3"
          )}
        >
          <LinkButton
            variant="secondary"
            size="xs"
            trailingIcon={RiArrowDownSLine}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? "Hide full profile" : "Full profile"}
          </LinkButton>
        </div>
      )}
    </div>
  );
}
