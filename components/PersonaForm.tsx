import { Button } from "@/components/ui/button";
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
    <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-14">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Participant persona
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The simulated participant you will interview. The richer the
          persona, the more believable the answers.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onUseSample}
        >
          Use sample persona
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="personaName">Persona name</Label>
            <Input
              id="personaName"
              placeholder="e.g. Maya Chen"
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="personaRole">Role</Label>
            <Input
              id="personaRole"
              placeholder="e.g. Freelance UI designer"
              value={value.role}
              onChange={(e) => set("role", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="personaAgeRange">Age range</Label>
          <Input
            id="personaAgeRange"
            placeholder="e.g. 28 to 32"
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
      </div>
    </section>
  );
}
