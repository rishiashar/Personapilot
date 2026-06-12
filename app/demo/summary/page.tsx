"use client";

import { SessionSummary } from "@/components/SessionSummary";
import { DEMO_SESSION } from "@/lib/demoSession";

export default function DemoSummaryPage() {
  return (
    <main className="flex flex-1 flex-col">
      <SessionSummary session={DEMO_SESSION} />
    </main>
  );
}
