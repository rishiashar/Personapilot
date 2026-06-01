import { Target, Wand2 } from "lucide-react";

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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Target className="size-4" />
            </span>
            <div>
              <CardTitle>Research context</CardTitle>
              <CardDescription>
                What you are studying and what you want to learn.
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
            Use sample context
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5">
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

        <div className="grid gap-2 sm:grid-cols-2 sm:gap-5">
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
      </CardContent>
    </Card>
  );
}
