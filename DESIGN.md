# ProbeRoom design language

Distilled from the landing page. Every screen in the rehearsal flow follows
these rules.

## Foundations

- **Radius 0.** No rounded corners anywhere.
- **Black strokes.** Primary frames and panel dividers use `border-foreground`
  (full black). Hairlines inside a frame (rows, form rules) use
  `border-border`.
- **One accent.** Brand blue (`brand`) is the only accent color. It marks
  progress, the active voice, and hover states on primary buttons
  (`hover:bg-brand`).
- **Pastel washes for state.** `wash-green` / `wash-amber` / `wash-red` /
  `wash-blue` communicate judgement (strong / mixed / needs work / info).
  Never decorative.
- **No em or en dashes** in copy. Use commas, colons, or "to".

## Type

- **Caps labels.** Section and panel eyebrows use `.caps` (mono, uppercase,
  tracked out). Panel headers are caps, never sentence case.
- **Title moments.** Page-level headers are centered: caps eyebrow, then a
  large tight heading (`tracking-[-0.02em]`), then a short muted description.
  Body content below stays left-aligned for readability.
- **Numbers are mono.** Counters, timestamps, and stats use
  `font-mono tabular-nums`.

## Layout

- **Centered bookends, left-aligned reading.** Hero-style headers and closing
  actions center; forms, lists, and paragraphs keep a hard left edge.
- **Panels share a header band.** Inside a console frame, every panel header
  is the same fixed height (`h-12`), vertically centered, with a
  `border-border` rule below. Caps title on the left, mono meta on the right.
- **Frames do the cropping.** Content can bleed off a card's bottom-right;
  the card edge is the crop.

## Motion

- **Rise on entry.** Page headers stagger in with `animate-rise`; below-fold
  sections use `<Reveal>`.
- **Hard shadow on hover.** Interactive cards lift with
  `hover:shadow-[8px_8px_0_0_var(--foreground)]`.
- **Reduced motion respected.** Every animation has a
  `motion-reduce` / `prefers-reduced-motion` fallback.
