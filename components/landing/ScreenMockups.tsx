import { Mic, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";

function Window({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none border border-foreground bg-background text-left shadow-[8px_8px_0_0_var(--foreground)] select-none",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-foreground px-3 py-2">
        <span className="caps">{label}</span>
        <span className="flex gap-1">
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground/20" />
          <span className="size-1.5 bg-foreground" />
        </span>
      </div>
      {children}
    </div>
  );
}

function MockTag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "green" | "amber" | "red" | "neutral";
}) {
  const tones = {
    blue: "bg-wash-blue text-wash-blue-fg",
    green: "bg-wash-green text-wash-green-fg",
    amber: "bg-wash-amber text-wash-amber-fg",
    red: "bg-wash-red text-wash-red-fg",
    neutral: "bg-muted text-muted-foreground",
  } as const;
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.06em] uppercase",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function QuestionShiftMockup({ className }: { className?: string }) {
  return (
    <Window label="Same study · Different questions" className={className}>
      <div className="grid divide-y divide-foreground/15 text-[11px] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="space-y-2 p-4">
          <MockTag tone="neutral">What we asked first</MockTag>
          <p className="font-medium">Which links do you open in the app?</p>
          <p className="border border-border bg-muted/40 px-2.5 py-2 text-muted-foreground">
            Mostly the library page. Sometimes the shuttle schedule.
          </p>
          <MockTag tone="amber">Surface level</MockTag>
        </div>
        <div className="space-y-2 p-4">
          <MockTag tone="blue">What we asked instead</MockTag>
          <p className="font-medium">When do you feel connected to UofT?</p>
          <p className="border border-border bg-muted/40 px-2.5 py-2 text-muted-foreground">
            Honestly? During convocation season. The rest of the year it feels
            like a place I commute to, not a place I belong to.
          </p>
          <MockTag tone="green">Real insight</MockTag>
        </div>
      </div>
    </Window>
  );
}

export function SetupMockup({ className }: { className?: string }) {
  return (
    <Window label="Setup · Question guide" className={className}>
      <div className="space-y-3 p-4 text-[11px]">
        <div className="flex flex-col items-center gap-2 border border-dashed border-foreground/40 bg-muted/40 px-4 py-6 text-center">
          <UploadCloud className="size-5 text-muted-foreground" />
          <p className="font-medium">Drop your interview script here</p>
          <p className="text-muted-foreground">or browse files. txt, md, docx</p>
        </div>
        <div className="space-y-1.5">
          {[
            "Tell me about the last time you ordered groceries online.",
            "Walk me through how dinner came together last night.",
            "How do you decide when delivery is worth the fees?",
          ].map((q, i) => (
            <div
              key={q}
              className="flex items-start gap-2 border border-border bg-card px-2.5 py-1.5"
            >
              <span className="font-mono text-[9px] text-muted-foreground">
                {i + 1}
              </span>
              <span className="leading-snug">{q}</span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}

export function InterviewMockup({ className }: { className?: string }) {
  return (
    <Window label="Interview · Live" className={className}>
      <div className="grid grid-cols-[88px_minmax(0,1fr)] text-[10px]">
        <div className="border-r border-foreground p-2.5">
          <p className="caps mb-2 text-[8px]">Questions · 2/5</p>
          <div className="space-y-1.5">
            {[true, true, false, false, false].map((done, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-2 shrink-0 border border-foreground/50",
                    done && "bg-brand",
                  )}
                />
                <span
                  className={cn(
                    "h-1.5 flex-1 bg-foreground/15",
                    done && "bg-foreground/30",
                  )}
                />
              </div>
            ))}
          </div>
          <p className="caps mt-3 mb-1.5 text-[8px]">Participant</p>
          <div className="flex items-center gap-1.5">
            <span className="flex size-5 items-center justify-center bg-foreground text-[7px] font-semibold text-background">
              DO
            </span>
            <span className="h-1.5 flex-1 bg-foreground/15" />
          </div>
        </div>
        <div className="flex flex-col p-3">
          <div className="flex flex-1 flex-col gap-2">
            <div className="max-w-[85%] self-end border border-border bg-muted/60 px-2.5 py-1.5 leading-snug">
              Walk me through how dinner came together last night.
            </div>
            <div className="max-w-[90%] border border-border bg-card px-2.5 py-1.5 leading-snug">
              It was one of those whatever gets everyone fed evenings. I checked
              the fridge list and improvised pasta so nobody had to do a second
              grocery run.
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5">
            <span className="flex size-6 items-center justify-center bg-foreground text-background">
              <Mic className="size-3" />
            </span>
            <span className="flex h-4 flex-1 items-end gap-[2px]">
              {[3, 7, 11, 15, 9, 13, 6, 12, 16, 8, 4, 10, 14, 7, 3].map(
                (h, i) => (
                  <span
                    key={i}
                    className="w-[3px] bg-brand"
                    style={{ height: `${h}px` }}
                  />
                ),
              )}
            </span>
            <span className="text-[9px] text-muted-foreground">
              Speaking...
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}

export function SummaryMockup({ className }: { className?: string }) {
  const rows = [
    {
      q: "Tell me about how dinner came together last night.",
      kind: { label: "Concrete story", tone: "green" as const },
      align: { label: "On goal", tone: "green" as const },
    },
    {
      q: "Thoughts?",
      kind: { label: "Opinion", tone: "neutral" as const },
      align: { label: "Partial", tone: "amber" as const },
    },
    {
      q: "Do you feel stressed when the window slips?",
      kind: { label: "Yes or no", tone: "red" as const },
      align: { label: "On goal", tone: "green" as const },
    },
  ];
  return (
    <Window label="Summary · Question by question" className={className}>
      <div className="p-3.5">
        <div className="mb-3 flex items-center gap-3 border border-foreground bg-wash-green px-3 py-2">
          <span className="text-sm font-semibold text-wash-green-fg">
            Strong session
          </span>
          <span className="flex h-2 flex-1 overflow-hidden">
            <span className="w-1/2 bg-wash-green-fg/70" />
            <span className="w-1/4 bg-wash-amber-fg/60" />
            <span className="w-1/4 bg-wash-red-fg/50" />
          </span>
        </div>
        <div className="divide-y divide-border border border-border">
          {rows.map((row, i) => (
            <div key={row.q} className="flex items-center gap-2 px-2.5 py-2">
              <span className="font-mono text-[9px] text-muted-foreground">
                {i + 1}
              </span>
              <span className="flex-1 text-[10px] leading-snug font-medium">
                {row.q}
              </span>
              <MockTag tone={row.kind.tone}>{row.kind.label}</MockTag>
              <MockTag tone={row.align.tone}>{row.align.label}</MockTag>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}
