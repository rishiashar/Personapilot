import { Reveal } from "@/components/landing/Reveal";

const SPECTRUM_GRADIENT =
  "linear-gradient(90deg, #FFA0B4, #FFC280, #FFE47C, #A4E29A, #80D3F7, #AAB4FF, #D3A6FF, #FFA2DB, #FFA0B4)";

export function AppFooter() {
  return (
    <footer className="overflow-hidden bg-foreground pt-10 text-background">
      <Reveal>
        <p className="group relative -mb-[0.28em] text-center text-[clamp(4.5rem,16vw,15rem)] leading-none font-semibold tracking-[-0.045em] whitespace-nowrap select-none">
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
