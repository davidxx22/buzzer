"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";

export function Dialog({ title, children, onDismiss, busy = false }: {
  title: string;
  children: ReactNode;
  onDismiss: () => void;
  busy?: boolean;
}) {
  const heading = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;

    if (!modal.open) modal.showModal();
    const focusTarget = modal.querySelector<HTMLElement>("[data-initial-focus]") ?? headingRef.current;
    focusTarget?.focus();
  }, [title]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={heading}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) dialog.current?.close();
      }}
      onClose={onDismiss}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground backdrop:bg-foreground/50 sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 ref={headingRef} id={heading} tabIndex={-1} className="text-xl font-bold tracking-tight">{title}</h2>
        <Button type="button" variant="ghost" className="size-11 shrink-0 px-0" aria-label="Close dialog" disabled={busy} onClick={() => dialog.current?.close()}>
          <X size={20} aria-hidden="true" />
        </Button>
      </div>
      {children}
    </dialog>
  );
}
