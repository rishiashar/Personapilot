// The footer mark: at rest it is the ink logo; on hover the door panels
// swing open and the voice bars speak in brand blue.
function FooterMark() {
  return (
    <span className="group inline-flex" aria-hidden>
      <svg viewBox="-22 0 733 557" className="h-7 w-auto text-background">
        <g className="transition-colors duration-300 group-hover:text-brand">
          <rect x="0" y="207" width="42" height="146" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar" />
          <rect x="90" y="105" width="42" height="348" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:180ms]" />
          <rect x="557" y="105" width="42" height="348" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:360ms]" />
          <rect x="647" y="207" width="42" height="146" rx="21" fill="currentColor" className="origin-center [transform-box:fill-box] group-hover:animate-wavebar [animation-delay:540ms]" />
        </g>
        <g fill="currentColor" stroke="currentColor" strokeWidth="44" strokeLinejoin="round">
          <path
            d="M220 36 L288 87 L288 468 L220 519 Z"
            className="transition-transform duration-500 ease-out group-hover:-translate-x-[28px]"
          />
          <path
            d="M469 36 L401 87 L401 468 L469 519 Z"
            className="transition-transform duration-500 ease-out group-hover:translate-x-[28px]"
          />
        </g>
      </svg>
    </span>
  );
}

export function AppFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-5 py-12 text-center sm:px-8">
        <FooterMark />
        <p className="text-[13px] text-background/60">
          Made by <span className="font-medium text-background">Rishi Ashar</span>
        </p>
      </div>
    </footer>
  );
}
