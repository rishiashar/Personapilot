import { RiShuffleLine } from "@remixicon/react";

import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/input/textarea";
import { Eyebrow } from "@/components/Eyebrow";
import type { ResearchContext } from "@/lib/types";

export function ResearchContextForm({
  value,
  onChange,
  onUseSample,
}: {
  value: ResearchContext;
  onChange: (next: ResearchContext) => void;
  onUseSample: () => void;
}) {
  const set = (key: keyof ResearchContext, fieldValue: string) =>
    onChange({ ...value, [key]: fieldValue });

  return (
    <section className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
      <div>
        <Eyebrow>Research context</Eyebrow>
        <p className="mt-2 text-body-regular text-text-secondary">
          What you are studying and what you want to learn.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="small"
          leadingIcon={RiShuffleLine}
          className="mt-4"
          onClick={onUseSample}
        >
          Use sample context
        </Button>
      </div>

      <div className="stagger-children grid gap-5">
        <Input
          label="Project name"
          isRequired
          placeholder="e.g. Freelancer project management study"
          value={value.projectName}
          onChange={(fieldValue) => set("projectName", fieldValue)}
        />

        <TextArea
          label="Research goal"
          rows={3}
          placeholder="What is the core question this research should answer?"
          value={value.researchGoal}
          onChange={(fieldValue) => set("researchGoal", fieldValue)}
        />

        <TextArea
          label="Product context"
          rows={3}
          placeholder="Describe the product or experience participants will react to."
          value={value.productContext}
          onChange={(fieldValue) => set("productContext", fieldValue)}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Target audience"
            placeholder="e.g. Freelance designers and developers"
            value={value.targetAudience}
            onChange={(fieldValue) => set("targetAudience", fieldValue)}
          />
          <Input
            label="Key learning goals"
            placeholder="e.g. Understand how freelancers track projects"
            value={value.keyLearningGoals}
            onChange={(fieldValue) => set("keyLearningGoals", fieldValue)}
          />
        </div>
      </div>
    </section>
  );
}
