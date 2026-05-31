import { UserRound, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Persona } from "@/lib/types";

export type PersonaDraft = Omit<Persona, "id" | "createdAt">;

export function PersonaForm({
  value,
  onChange,
  onUseSample,
}: {
  value: PersonaDraft;
  onChange: (next: PersonaDraft) => void;
  onUseSample: () => void;
}) {
  const set = (key: keyof PersonaDraft, fieldValue: string) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <UserRound className="size-4" />
            </span>
            <div>
              <CardTitle>Participant persona</CardTitle>
              <CardDescription>
                The simulated participant you will interview.
              </CardDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onUseSample}
          >
            <Wand2 />
            Use sample UofT student persona
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
          <div className="grid gap-2">
            <Label htmlFor="personaName">Persona name</Label>
            <Input
              id="personaName"
              placeholder="e.g. Aanya Patel"
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="personaRole">Role</Label>
            <Input
              id="personaRole"
              placeholder="e.g. First year international student"
              value={value.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaAgeRange">Age range</Label>
          <Input
            id="personaAgeRange"
            placeholder="e.g. 18 to 20"
            value={value.ageRange}
            onChange={(e) => set("ageRange", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaBackground">Background</Label>
          <Textarea
            id="personaBackground"
            placeholder="Who is this person and what is their situation?"
            value={value.background}
            onChange={(e) => set("background", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaBehaviours">Behaviours</Label>
          <Textarea
            id="personaBehaviours"
            placeholder="How do they typically act or use tools?"
            value={value.behaviours}
            onChange={(e) => set("behaviours", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaGoals">Goals</Label>
          <Textarea
            id="personaGoals"
            placeholder="What are they trying to achieve?"
            value={value.goals}
            onChange={(e) => set("goals", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaFrustrations">Frustrations</Label>
          <Textarea
            id="personaFrustrations"
            placeholder="What gets in their way or annoys them?"
            value={value.frustrations}
            onChange={(e) => set("frustrations", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaVoiceStyle">Voice style</Label>
          <Textarea
            id="personaVoiceStyle"
            placeholder="How do they speak? Tone, pacing, vocabulary."
            value={value.voiceStyle}
            onChange={(e) => set("voiceStyle", e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
