"use client";

import type { ReactNode, Ref } from "react";
import {
  TextArea as AriaTextArea,
  TextField as AriaTextField,
} from "react-aria-components";
import type { TextFieldProps as AriaTextFieldProps } from "react-aria-components";
import { HintText } from "./hint-text";
import { Label } from "./label";
import { cx } from "@/utils/cx";

/**
 * Multi-line counterpart to `Input`. BoardUI ships no textarea, so this one
 * reuses the Input field shell 1:1 (tertiary surface, radius/2lg, 2px inset
 * ring that steps hover → active) around a React Aria TextArea, with the same
 * Label and HintText wiring for `aria-labelledby` / `aria-describedby`.
 *
 * `onChange` receives the string value (React Aria TextField contract).
 */
export interface TextAreaProps
  extends Omit<AriaTextFieldProps, "className" | "children"> {
  label?: ReactNode;
  hint?: ReactNode;
  placeholder?: string;
  rows?: number;
  className?: string;
  /** Classes for the textarea element (min-height, resize behaviour). */
  fieldClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({
  label,
  hint,
  placeholder,
  rows = 4,
  className,
  fieldClassName,
  ref,
  ...props
}: TextAreaProps) {
  return (
    <AriaTextField
      {...props}
      aria-label={
        props["aria-label"] ?? (!label && placeholder ? placeholder : undefined)
      }
      className={cx("group flex w-full flex-col items-start gap-1", className)}
    >
      {({ isRequired, isInvalid, isDisabled }) => (
        <>
          {label && (
            <Label isRequired={isRequired} isInvalid={isInvalid}>
              {label}
            </Label>
          )}
          <AriaTextArea
            ref={ref}
            rows={rows}
            placeholder={placeholder}
            className={({ isFocused, isHovered }) =>
              cx(
                "w-full min-w-0 resize-y rounded-2lg bg-background-tertiary-default px-3 py-2 font-sans text-body-regular text-text-primary outline-none",
                "ring-2 ring-transparent ring-inset transition-[background-color,box-shadow] duration-[var(--input-transition-ms)] ease",
                "placeholder:text-text-tertiary focus:placeholder:text-text-primary",
                isHovered &&
                  !isFocused &&
                  !isDisabled &&
                  !isInvalid &&
                  "ring-border-button-hover",
                isFocused && !isDisabled && !isInvalid && "ring-border-button-active",
                isDisabled &&
                  "cursor-not-allowed bg-input-disabled-background text-input-disabled-text",
                isInvalid && "bg-background-tertiary-error",
                fieldClassName,
              )
            }
          />
          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </AriaTextField>
  );
}
