import type { ComponentProps } from "react";

function IconBase(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    />
  );
}

/** Persona sheet: a card with a participant portrait. */
export function SetupIcon(props: ComponentProps<"svg">) {
  return (
    <IconBase {...props}>
      <rect x="5.5" y="4" width="17" height="20" rx="1.5" />
      <circle cx="14" cy="11" r="3" />
      <path d="M9.5 18.5c1-2.6 2.7-3.9 4.5-3.9s3.5 1.3 4.5 3.9" />
    </IconBase>
  );
}

/** Microphone on a stand. */
export function InterviewIcon(props: ComponentProps<"svg">) {
  return (
    <IconBase {...props}>
      <rect x="11.5" y="3.5" width="5" height="10.5" rx="2.5" />
      <path d="M7.5 12.5a6.5 6.5 0 0 0 13 0" />
      <path d="M14 19v4.5" />
      <path d="M10 23.5h8" />
    </IconBase>
  );
}

/** Speech bubble with a check: reviewed conversation. */
export function FeedbackIcon(props: ComponentProps<"svg">) {
  return (
    <IconBase {...props}>
      <path d="M4.5 7A2.5 2.5 0 0 1 7 4.5h14A2.5 2.5 0 0 1 23.5 7v8a2.5 2.5 0 0 1-2.5 2.5h-8.5L8 21.5v-4H7A2.5 2.5 0 0 1 4.5 15z" />
      <path d="M10.5 11.3l2.3 2.3 4.7-4.8" />
    </IconBase>
  );
}
