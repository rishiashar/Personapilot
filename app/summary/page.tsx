"use client";

import { FileSearch } from "lucide-react";

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
          <div className="flex flex-1 items-center justify-center px-4 py-16 text-sm text-muted-foreground">
            Loading your summary…
          </div>
        ) : session ? (
          <SessionSummary session={session} />
        ) : (
          <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-8">
            <EmptyState
              icon={FileSearch}
              title="No session to summarize yet"
              description="Once you run a rehearsal interview, your session summary and placeholder feedback will appear here."
              primaryAction={{ label: "Start a rehearsal", href: "/setup" }}
            />
          </div>
        )}
      </main>
    </>
  );
}
