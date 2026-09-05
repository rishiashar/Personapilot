# ProbeRoom design language

Distilled from the BoardUI conversion. Every screen in the rehearsal flow
follows these rules.

## Foundations

- **Semantic tokens only.** Every color rides a BoardUI token: `text-text-primary`
  / `-secondary` / `-tertiary`, `bg-background-full` / `-primary-default` /
  `-secondary-default`, `border-border-button-default`. No raw palette classes
  (`text-gray-500`, `bg-white`), no hex or oklch literals, no `dark:` prefixes.
- **Dark mode is a class, not a fork.** The header toggle flips the `.dark`
  class on `<html>`; tokens carry the theme from there. If a token pair reads
  wrong in dark mode, pick a different token, never a literal override.
- **One accent, re-tinted.** The `accent-50` through `accent-950` ramp is
  retuned to ProbeRoom blue (hue 262, chroma held under 0.18). It is the only
  color used for CTAs, selection, focus rings, and links.
- **Pastel washes mark judgement only.** `wash-green` / `wash-amber` /
  `wash-red` / `wash-blue` with their `-fg` companions communicate verdicts
  (strong, mixed, needs work, info). Never used decoratively.
- **The spectrum stays reserved.** The eight `spectrum` tokens belong to the
  voice waveform and the footer wordmark sweep, and appear nowhere else.
- **No em or en dashes** in copy. Use commas, colons, or "to".

## Type

- **Caps labels via `Eyebrow`.** Every uppercase section or panel label uses
  the `Eyebrow` component, never a hand-rolled tracking and uppercase stack.
- **A scale, not a size.** Page titles use `display-3` or `display-4`, section
  headers use `title-2`, lead copy uses `headline`, everyday UI text uses
  `body`, and meta text uses `caption`. Pick the composite utility for the
  role, never stack size, weight, and leading by hand.
- **Numbers are mono.** Counters, timestamps, and stats add
  `font-mono tabular-nums`.

## Layout

- **Rounded geometry, by scale.** Cards are `rounded-3xl` with
  `border-border-button-default`, inner panels are `rounded-2xl`, controls are
  `rounded-2lg`, and chips are `rounded-full`.
- **Hairlines are `border-separator-border`.** Every rule inside a frame,
  between rows, or under a header uses this token, never the card border
  token.
- **Centered bookends, left-aligned reading.** Page-level headers center;
  forms, lists, and paragraphs keep a hard left edge.
- **Console panels share a header band.** Inside a console frame, every panel
  header sits in the same 48px band.

## Motion

- **Entrances condense into place.** Fade in, scale up slightly, and lose
  2px of blur, over 300 to 400ms with an ease-out curve.
- **Hover is quick.** Color and background transitions on hover run at 150ms.
- **Press darkens, it never scales.** A pressed control steps one token
  darker; it does not shrink or grow.
- **Exits are faster than entrances.** Leaving the screen should never feel
  slower than arriving on it.
- **`prefers-reduced-motion` is always respected.** Every animation utility
  has a reduced-motion fallback, no exceptions.
- **Use the shared utilities.** `animate-rise` for page blocks, `<Reveal>` for
  below-fold sections, `animate-message-in` for new transcript rows,
  `stagger-children` for cascading form rows.

BoardUI itself is documented at boardui.com. Its components are installed,
not hand-built: add one with `npx boardui@latest add <name>`.
