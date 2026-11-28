import { CircleAlert, Plus } from "lucide-react";
import Image from "next/image";
import type { MouseEventHandler } from "react";
import { Button } from "@/components/ui/button";

export function EmptyActiveQueue({ onNewOrder }: { onNewOrder: MouseEventHandler<HTMLButtonElement> }) {
  return (
    <div className="grid justify-items-center gap-3 rounded-xl border border-border px-4 py-6 text-center sm:px-6 sm:py-8">
      <Image src="/empty-queue-notepad.webp" alt="" width={360} height={360} unoptimized className="size-32 sm:size-36" />
      <div className="space-y-1">
        <h2 className="font-display text-3xl leading-none font-semibold">No active orders</h2>
        <p className="text-sm text-muted-foreground">Create an order to give the customer a pickup ticket.</p>
      </div>
      <Button type="button" className="mt-1" onClick={onNewOrder}>
        <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
        New order
      </Button>
    </div>
  );
}

export function QueueError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-4">
      <div role="alert" className="flex items-start gap-3 rounded-lg bg-danger-surface p-4 text-danger">
        <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div>
          <p className="font-semibold">The demo queue couldn’t load.</p>
          <p className="mt-1 text-sm">Check your connection and browser site storage, then try again.</p>
        </div>
      </div>
      <Button variant="outline" onClick={onRetry}>Try again</Button>
    </div>
  );
}
