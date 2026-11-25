"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QueueCounts } from "@/features/queue/queue-counts";
import { QueueError } from "@/features/queue/queue-feedback";
import { useQueue } from "@/features/queue/use-queue";
import { QueueQrCard } from "./queue-qr-card";

export function OwnerDashboard() {
  const { state, refresh } = useQueue();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12 print:max-w-none print:p-0">
      <div className="print:hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-[760] tracking-tight sm:text-4xl">Owner dashboard</h1>
            <p className="mt-2 leading-6 text-muted-foreground">These counts reflect tickets in this browser.</p>
          </div>
          <Button asChild variant="outline" className="shrink-0"><Link href="/staff">Open staff queue</Link></Button>
        </div>
        <div className="mt-6">
          {state.kind === "loaded" && <QueueCounts tickets={state.tickets} />}
          {state.kind === "loading" && <p role="status" className="text-muted-foreground">Loading the queue…</p>}
          {state.kind === "error" && <Card className="p-5"><QueueError onRetry={refresh} /></Card>}
        </div>
      </div>
      <QueueQrCard />
    </div>
  );
}
