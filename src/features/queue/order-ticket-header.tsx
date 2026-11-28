import type { ReactNode } from "react";

export function OrderTicketHeader({ number, children }: { number: string; children: ReactNode }) {
  return (
    <div className="flex items-stretch rounded-lg bg-muted">
      <p className="grid min-w-16 max-w-[40%] shrink-0 content-center gap-1 border-e border-dashed border-border px-3 py-2 text-center">
        <span className="text-xs font-medium text-muted-foreground">No.</span>
        <span className="font-display text-4xl leading-none font-semibold tabular-nums [overflow-wrap:anywhere]">{number.replace(/^#/, "")}</span>
      </p>
      <div className="grid min-w-0 flex-1 content-center gap-1 px-4 py-3 text-sm [overflow-wrap:anywhere]">
        {children}
      </div>
    </div>
  );
}
