"use client";

import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { InterviewRoom } from "@/components/InterviewRoom";
import { useHydrated, useSession } from "@/lib/useStore";

export default function InterviewPage() {
  const hydrated = useHydrated();
  const session = useSession();

  return (
    <>
      <AppHeader step="interview" />
      <main className="flex flex-1 flex-col">
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center px-4 py-16">
            <p className="text-sm text-muted-foreground">
              Loading your rehearsal…
            </p>
          </div>
        ) : session ? (
          <InterviewRoom initialSession={session} />
        ) : (
          <div className="mx-auto w-full max-w-2xl px-6 py-16">
            <EmptyState
              title="No rehearsal set up yet"
              description="Add your research context and a participant persona to start an interview session."
              primaryAction={{ label: "Go to setup", href: "/setup" }}
            />
          </div>
        )}
      </main>
    </>
  );
}
