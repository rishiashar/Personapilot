"use client";

import { RiFileChartLine } from "@remixicon/react";

import { AgentThinking } from "@/components/application/agent-thinking/agent-thinking";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { SessionSummary } from "@/components/SessionSummary";
import { useHydrated, useSession } from "@/lib/useStore";

export default function SummaryPage() {
  const hydrated = useHydrated();
  const session = useSession();

  return (
    <>
      <AppHeader step="summary" />
      <main className="flex flex-1 flex-col">
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <AgentThinking variant="stars" label="Loading your summary" showTimer={false} />
          </div>
        ) : session ? (
          <SessionSummary session={session} />
        ) : (
          <div className="mx-auto w-full max-w-2xl px-6 py-16">
            <EmptyState
              icon={RiFileChartLine}
              title="No session to summarize yet"
              description="Once you run a rehearsal interview, your session summary and feedback will appear here."
              primaryAction={{ label: "Start a rehearsal", href: "/setup" }}
            />
          </div>
        )}
      </main>
    </>
  );
}
