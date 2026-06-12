import { FooterWave } from "@/components/FooterWave";

export function AppFooter() {
  return (
    <footer className="border-t border-foreground">
      <FooterWave />
      <div className="border-t border-foreground/15">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-9 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
          <p className="text-[13px] font-medium">
            PersonaPilot. A rehearsal tool for UX research.
          </p>
          <p className="text-[13px] text-muted-foreground">
            Sessions stay in your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
