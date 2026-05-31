import { Sparkles } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Persona } from "@/lib/types";
import { getInitials } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm leading-relaxed text-foreground/90">{value}</p>
    </div>
  );
}

export function ParticipantCard({ persona }: { persona: Persona }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="bg-primary/10">
            <AvatarFallback className="bg-primary/10 font-medium text-primary">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">{persona.name}</CardTitle>
            <p className="truncate text-sm text-muted-foreground">
              {persona.role}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="secondary" className="font-normal">
            {persona.ageRange}
          </Badge>
          <Badge variant="outline" className="gap-1 font-normal">
            <Sparkles className="size-3" />
            Simulated participant
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Separator />
        <DetailRow label="Background" value={persona.background} />
        <DetailRow label="Behaviours" value={persona.behaviours} />
        <DetailRow label="Goals" value={persona.goals} />
        <DetailRow label="Frustrations" value={persona.frustrations} />
        <Separator />
        <DetailRow label="Voice style" value={persona.voiceStyle} />
      </CardContent>
    </Card>
  );
}
