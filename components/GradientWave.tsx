import { cn } from "@/lib/utils";

const VIEW_WIDTH = 1200;
const VIEW_HEIGHT = 120;

/**
 * Smooth sine-like wave built from chained quadratic curves (C1-continuous at
 * the joins). Drawn at 2x the viewBox width so a -1200px drift loops
 * seamlessly; wavelengths must divide 1200 for the pattern to tile.
 */
function sinePath(amplitude: number, wavelength: number, flip = false): string {
  const yc = VIEW_HEIGHT / 2;
  let sign = flip ? -1 : 1;
  let d = `M 0 ${yc}`;
  for (let x = 0; x < VIEW_WIDTH * 2; x += wavelength / 2) {
    d += ` Q ${x + wavelength / 4} ${yc + sign * 2 * amplitude} ${
      x + wavelength / 2
    } ${yc}`;
    sign = -sign;
  }
  return d;
}

const LAYERS = [
  {
    amp: 22,
    lambda: 400,
    stops: ["#6D8DF2", "#A78BFA", "#5BBFA8"],
    width: 2.5,
    opacity: 0.95,
    duration: 26,
    delay: 0,
    flip: false,
    glow: true,
  },
  {
    amp: 14,
    lambda: 300,
    stops: ["#5BBFA8", "#6D8DF2"],
    width: 2,
    opacity: 0.55,
    duration: 18,
    delay: -7,
    flip: true,
    glow: false,
  },
  {
    amp: 30,
    lambda: 600,
    stops: ["#F0A8C0", "#A78BFA"],
    width: 1.5,
    opacity: 0.4,
    duration: 36,
    delay: -15,
    flip: false,
    glow: false,
  },
];

export function GradientWave({
  className,
  id = "pp-wave",
}: {
  className?: string;
  /** Unique per page when the wave appears more than once. */
  id?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden
      className={cn("block", className)}
    >
      <defs>
        {LAYERS.map((layer, i) => (
          <linearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="0">
            {layer.stops.map((color, j) => (
              <stop
                key={j}
                offset={j / (layer.stops.length - 1)}
                stopColor={color}
              />
            ))}
          </linearGradient>
        ))}
      </defs>
      {LAYERS.map((layer, i) => {
        const d = sinePath(layer.amp, layer.lambda, layer.flip);
        return (
          <g
            key={i}
            className="animate-wave-drift"
            style={{
              animationDuration: `${layer.duration}s`,
              animationDelay: `${layer.delay}s`,
              willChange: "transform",
            }}
          >
            {layer.glow && (
              <path
                d={d}
                fill="none"
                stroke={`url(#${id}-${i})`}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.12}
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={`url(#${id}-${i})`}
              strokeWidth={layer.width}
              strokeLinecap="round"
              opacity={layer.opacity}
            />
          </g>
        );
      })}
    </svg>
  );
}
