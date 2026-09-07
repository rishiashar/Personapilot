"use client";

import type { HTMLAttributes, ReactNode } from "react";
import {
  Dialog as AriaDialog,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import type { ModalOverlayProps as AriaModalOverlayProps } from "react-aria-components";
import { cx } from "@/utils/cx";

/**
 * Modal dialog on React Aria's ModalOverlay / Modal / Dialog, dressed with
 * the BoardUI modal recipe: the panel condenses in from scale 0.85 with a 4px
 * blur over 300ms on cubic-bezier(0.32, 0.72, 0, 1) while the backdrop
 * cross-fades. React Aria stamps `data-entering` / `data-exiting`, so one
 * transition plays both ways and the element unmounts after the exit.
 *
 *   <Dialog isOpen={open} onOpenChange={setOpen} role="alertdialog">
 *     <DialogTitle>Title</DialogTitle>
 *     <DialogDescription>Copy</DialogDescription>
 *     ...
 *   </Dialog>
 */
export interface DialogProps
  extends Omit<AriaModalOverlayProps, "children" | "className"> {
  children: ReactNode;
  role?: "dialog" | "alertdialog";
  "aria-label"?: string;
  className?: string;
}

export function Dialog({
  children,
  role = "dialog",
  "aria-label": ariaLabel,
  className,
  ...props
}: DialogProps) {
  return (
    <AriaModalOverlay
      isDismissable
      {...props}
      className={cx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4",
        "transition-opacity duration-300 ease-out",
        "data-[entering]:opacity-0 data-[exiting]:opacity-0",
      )}
    >
      <AriaModal
        className={cx(
          "w-full max-w-md transform-gpu rounded-3xl border border-border-button-default bg-background-primary-default p-6 shadow-xl outline-none",
          "transition-[opacity,transform,filter] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[opacity,transform,filter]",
          "data-[entering]:scale-[0.85] data-[entering]:opacity-0 data-[entering]:blur-[4px]",
          "data-[exiting]:scale-[0.85] data-[exiting]:opacity-0 data-[exiting]:blur-[4px]",
          className,
        )}
      >
        <AriaDialog role={role} aria-label={ariaLabel} className="outline-none">
          {children}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

export function DialogTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <AriaHeading
      slot="title"
      className={cx("text-title-3-semibold text-text-primary", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx("text-body-regular text-text-secondary", className)}
      {...props}
    />
  );
}
