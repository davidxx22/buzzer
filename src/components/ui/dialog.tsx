"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { Button } from "./button";

export function Dialog({ title, children, onDismiss, busy = false, dialogRef }: {
  title: string;
  children: ReactNode;
  onDismiss: () => void;
  busy?: boolean;
  dialogRef?: RefObject<HTMLDialogElement | null>;
}) {
  const heading = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const internalRef = useRef<HTMLDialogElement>(null);
  const dialog = dialogRef ?? internalRef;

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;

    if (!modal.open) modal.showModal();
    const focusTarget = modal.querySelector<HTMLElement>("[data-initial-focus]") ?? headingRef.current;
    focusTarget?.focus();
  }, [dialog, title]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={heading}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) dialog.current?.close();
      }}
      onClose={onDismiss}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-4 text-foreground shadow-xl shadow-black/10 backdrop:bg-foreground/40 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-2">
        <h2 ref={headingRef} id={heading} tabIndex={-1} className="font-display text-[1.75rem] leading-none font-semibold">{title}</h2>
        <Button type="button" variant="ghost" className="size-11 shrink-0 px-0" aria-label="Close dialog" disabled={busy} onClick={() => dialog.current?.close()}>
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
