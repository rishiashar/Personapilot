"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function countQuestions(text: string): number {
  return text.split("\n").filter((line) => line.trim().length > 0).length;
}

export function QuestionGuideForm({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-questions", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        questions?: string[];
        error?: string;
      };
      if (!res.ok || !data.questions) {
        setImportError(data.error ?? "Could not read that document.");
        return;
      }
      const existing = value.trim();
      const imported = data.questions.join("\n");
      onChange(existing ? `${existing}\n${imported}` : imported);
    } catch {
      setImportError("Upload failed. Check your connection and try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const total = countQuestions(value);

  return (
    <section className="grid gap-8 md:grid-cols-[240px_minmax(0,1fr)] md:gap-14">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Question guide
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Optional. The questions you plan to ask, shown beside the interview
          room so you can read while you talk.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          disabled={isImporting}
          onClick={() => fileRef.current?.click()}
        >
          {isImporting ? (
            <>
              <Loader2 className="animate-spin" />
              Reading document…
            </>
          ) : (
            "Import from file"
          )}
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          PDF, Word (.docx), text, or Markdown.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="sr-only"
          aria-label="Import questions from a document"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="questionGuide">Questions, one per line</Label>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {total} {total === 1 ? "question" : "questions"}
          </span>
        </div>
        <Textarea
          id="questionGuide"
          rows={10}
          className="min-h-56"
          placeholder={
            "Walk me through your typical Monday morning.\nTell me about the last time that workflow broke down."
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {importError ? (
          <p role="status" className="text-xs text-destructive">
            {importError}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            You can ask anything during the interview. This list is a script
            to glance at, not a cage.
          </p>
        )}
      </div>
    </section>
  );
}
