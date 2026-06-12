import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-14">
      <div>
        <h2 className="caps">Research context</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onUseSample}
        >
          Use sample context
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="projectName">Project name</Label>
          <Input
            id="projectName"
            placeholder="e.g. Freelancer project management study"
            value={value.projectName}
            onChange={(e) => set("projectName", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="researchGoal">Research goal</Label>
          <Textarea
            id="researchGoal"
            placeholder="What is the core question this research should answer?"
            value={value.researchGoal}
            onChange={(e) => set("researchGoal", e.target.value)}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="productContext">Product context</Label>
          <Textarea
            id="productContext"
            placeholder="Describe the product or experience participants will react to."
            value={value.productContext}
            onChange={(e) => set("productContext", e.target.value)}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="targetAudience">Target audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g. Freelance designers and developers"
              value={value.targetAudience}
              onChange={(e) => set("targetAudience", e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="keyLearningGoals">Key learning goals</Label>
            <Input
              id="keyLearningGoals"
              placeholder="e.g. Understand how freelancers track projects"
              value={value.keyLearningGoals}
              onChange={(e) => set("keyLearningGoals", e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
