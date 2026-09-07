"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  RiFileTextLine,
  RiLoader4Line,
  RiUploadCloud2Line,
} from "@remixicon/react";

import { Divider } from "@/components/base/divider/divider";
import { TextArea } from "@/components/base/input/textarea";
import { Eyebrow } from "@/components/Eyebrow";
import { cx } from "@/utils/cx";

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
    <section className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-12">
      <div>
        <Eyebrow>Question guide</Eyebrow>
        <p className="mt-2 text-body-regular text-text-secondary">
          Optional. Shown beside the interview room so you can read while you talk.
        </p>
      </div>

      <div className="stagger-children grid gap-5">
        {/* Upload zone */}
        <div className="grid gap-2">
          <Eyebrow>Import your script</Eyebrow>
          <button
            type="button"
            disabled={isImporting}
            onClick={() => fileRef.current?.click()}
            onDragEnter={onDragEnter}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            aria-label="Upload a question document"
            className={cx(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-150",
              isDragging
                ? "border-accent-500 bg-accent-50"
                : "border-border-button-default bg-background-secondary-default hover:border-border-button-hover",
              isImporting && "cursor-wait opacity-80"
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-file-upload-icon-background text-file-upload-icon-foreground">
              {isImporting ? (
                <RiLoader4Line className="size-5 animate-spin" />
              ) : (
                <RiUploadCloud2Line className="size-5" />
              )}
            </span>
            <span className="text-body-medium text-text-primary">
              {isImporting
                ? "Reading your document"
                : isDragging
                  ? "Drop it here"
                  : "Drag and drop your question document"}
            </span>
            <span className="text-caption-1-medium text-text-secondary">
              or browse files. PDF, Word (.docx), text, or Markdown
            </span>
          </button>
          {importError ? (
            <p role="status" className="text-caption-1-medium text-text-error-primary">
              {importError}
            </p>
          ) : importedFile ? (
            <p
              role="status"
              className="flex items-center gap-1.5 text-caption-1-medium text-state-success-text"
            >
              <RiFileTextLine className="size-3.5" />
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

        <Divider>or type them</Divider>

        {/* Manual entry */}
        <div className="grid gap-2">
          <div className="flex items-baseline justify-between">
            <span className="text-body-medium text-text-primary">
              Questions, one per line
            </span>
            <span className="font-mono text-caption-1-medium tabular-nums text-text-tertiary">
              {total} {total === 1 ? "question" : "questions"}
            </span>
          </div>
          <TextArea
            aria-label="Questions, one per line"
            rows={10}
            fieldClassName="min-h-56"
            placeholder={
              "Walk me through your typical Monday morning.\nTell me about the last time that workflow broke down."
            }
            value={value}
            onChange={(fieldValue) => onChange(fieldValue)}
          />
        </div>
      </div>
    </section>
  );
}
