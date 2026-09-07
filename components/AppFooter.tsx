import { Reveal } from "@/components/landing/Reveal";

const SPECTRUM_GRADIENT =
  "linear-gradient(90deg, var(--color-spectrum-1), var(--color-spectrum-2), var(--color-spectrum-3), var(--color-spectrum-4), var(--color-spectrum-5), var(--color-spectrum-6), var(--color-spectrum-7), var(--color-spectrum-8), var(--color-spectrum-1))";

export function AppFooter() {
  return (
    <footer className="overflow-hidden border-t border-separator-border bg-background-secondary-default pt-10">
      <Reveal>
        <p className="group relative -mb-[0.28em] text-center text-[clamp(4.5rem,16vw,15rem)] leading-none font-semibold tracking-[-0.045em] whitespace-nowrap text-text-primary select-none">
          ProbeRoom
          <span
            aria-hidden
            className="animate-spectrum-sweep absolute inset-0 bg-clip-text text-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              backgroundImage: SPECTRUM_GRADIENT,
              backgroundSize: "200% auto",
            }}
          >
            ProbeRoom
          </span>
        </p>
      </Reveal>
    </footer>
  );
}
