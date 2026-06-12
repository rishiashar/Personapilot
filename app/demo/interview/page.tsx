"use client";

import { InterviewRoom } from "@/components/InterviewRoom";
import { DEMO_SESSION } from "@/lib/demoSession";

export default function DemoInterviewPage() {
  return (
    <main className="flex flex-1 flex-col">
      <InterviewRoom initialSession={DEMO_SESSION} />
    </main>
  );
}
