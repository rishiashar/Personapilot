import { RiShuffleLine } from "@remixicon/react";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/input/textarea";
import { Eyebrow } from "@/components/Eyebrow";
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
    <section className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
      <div>
        <Eyebrow>Participant persona</Eyebrow>
        <p className="mt-2 text-body-regular text-text-secondary">
          The simulated participant you will interview. Richer detail makes the answers more believable.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="small"
          leadingIcon={RiShuffleLine}
          className="mt-4"
          onClick={onUseSample}
        >
          Use sample persona
        </Button>
      </div>

      <div className="stagger-children grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Persona name"
            isRequired
            placeholder="e.g. Maya Chen"
            value={value.name}
            onChange={(fieldValue) => set("name", fieldValue)}
          />
          <Input
            label="Role"
            placeholder="e.g. Freelance UI designer"
            value={value.role}
            onChange={(fieldValue) => set("role", fieldValue)}
          />
        </div>

        <Input
          label="Age range"
          placeholder="e.g. 28 to 32"
          value={value.ageRange}
          onChange={(fieldValue) => set("ageRange", fieldValue)}
        />

        <TextArea
          label="Background"
          rows={3}
          placeholder="Who is this person and what is their situation?"
          value={value.background}
          onChange={(fieldValue) => set("background", fieldValue)}
        />

        <TextArea
          label="Behaviours"
          rows={3}
          placeholder="How do they typically act or use tools?"
          value={value.behaviours}
          onChange={(fieldValue) => set("behaviours", fieldValue)}
        />

        <TextArea
          label="Goals"
          rows={3}
          placeholder="What are they trying to achieve?"
          value={value.goals}
          onChange={(fieldValue) => set("goals", fieldValue)}
        />

        <TextArea
          label="Frustrations"
          rows={3}
          placeholder="What gets in their way or annoys them?"
          value={value.frustrations}
          onChange={(fieldValue) => set("frustrations", fieldValue)}
        />

        <TextArea
          label="Voice style"
          rows={3}
          placeholder="How do they speak? Tone, pacing, vocabulary."
          value={value.voiceStyle}
          onChange={(fieldValue) => set("voiceStyle", fieldValue)}
        />
      </div>
    </section>
  );
}
