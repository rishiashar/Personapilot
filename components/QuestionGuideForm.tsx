"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileText, Loader2, Upload } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function countQuestions(text: string): number {
  return text.split("\n").filter((line) => line.trim().length > 0).length;
}

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md"];

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
  const [importedFile, setImportedFile] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  const handleFile = async (file: File) => {
    setIsImporting(true);
    setImportError(null);
    setImportedFile(null);
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
      setImportedFile(
        `${file.name}: ${data.questions.length} ${
          data.questions.length === 1 ? "question" : "questions"
        } added`
      );
    } catch {
      setImportError("Upload failed. Check your connection and try again.");
    } finally {
      setIsImporting(false);
    }
  };

  const acceptFirstFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
      setImportError("That file type is not supported. Use PDF, Word, text, or Markdown.");
      return;
    }
    void handleFile(file);
  };

  const onDragEnter = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  };
  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (isImporting) return;
    acceptFirstFile(e.dataTransfer.files);
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
      </div>

      <div className="grid gap-6">
        {/* Upload zone */}
        <div className="grid gap-2">
          <p className="caps text-muted-foreground">Import your script</p>
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileRef.current?.click()}
            onDragEnter={onDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            aria-label="Upload a question document"
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors",
              isDragging
                ? "border-brand bg-wash-blue"
                : "border-border bg-card hover:border-foreground hover:bg-muted/50",
              isImporting && "cursor-wait opacity-80"
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center border",
                isDragging
                  ? "border-brand bg-background text-brand"
                  : "border-foreground bg-background"
              )}
            >
              {isImporting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Upload className="size-5" />
              )}
            </span>
            <span className="text-sm font-semibold tracking-tight">
              {isImporting
                ? "Reading your document…"
                : isDragging
                  ? "Drop it here"
                  : "Drag and drop your question document"}
            </span>
            <span className="text-xs text-muted-foreground">
              or <span className="font-medium text-foreground underline underline-offset-2">browse files</span>
              {" · "}PDF, Word (.docx), text, or Markdown
            </span>
          </button>
          {importError ? (
            <p role="status" className="text-xs text-destructive">
              {importError}
            </p>
          ) : importedFile ? (
            <p
              role="status"
              className="flex items-center gap-1.5 text-xs text-wash-green-fg"
            >
              <FileText className="size-3.5" />
              {importedFile}
            </p>
          ) : null}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            className="sr-only"
            aria-label="Import questions from a document"
            onChange={(e) => {
              acceptFirstFile(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-border" />
          <span className="caps text-muted-foreground">or type them</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Manual entry */}
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
          <p className="text-xs text-muted-foreground">
            You can ask anything during the interview. This list is a script
            to glance at, not a cage.
          </p>
        </div>
      </div>
    </section>
  );
}
