"use client";

import { BellRing, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTicketNumber, isOrderId, isPickupOrder, statusLabels, type PickupOrder } from "./model";
import { QueueError } from "./queue-feedback";
import { readTicketSnapshot } from "./ticket-link";
import { useQueue } from "./use-queue";

function TicketShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <Card className="p-6 sm:p-8">{children}</Card>
    </div>
  );
}

export function TicketLoading() {
  return <TicketShell><p role="status" className="text-muted-foreground">Loading your ticket…</p></TicketShell>;
}

function TicketUnavailable() {
  return (
    <TicketShell>
      <h1 className="text-xl font-bold">Pickup ticket unavailable</h1>
      <p className="mt-2 leading-6 text-muted-foreground">Ask the cashier to show the QR for your order again.</p>
    </TicketShell>
  );
}

export function PickupTicket() {
  const params = useSearchParams();
  const id = params.get("order");
  if (!isOrderId(id)) return <TicketUnavailable />;

  return <OrderTicket key={id} id={id} snapshot={params.get("preview")} />;
}

function OrderTicket({ id, snapshot }: { id: string; snapshot: string | null }) {
  const { state, refresh } = useQueue(id);

  if (state.kind === "loading") return <TicketLoading />;
  if (state.kind === "error") return <TicketShell><QueueError onRetry={refresh} /></TicketShell>;

  const saved = state.tickets.find(isPickupOrder);
  const order = saved ?? (state.source === "browser" ? readTicketSnapshot(id, snapshot) : null);
  if (!order) return <TicketUnavailable />;

  return <TicketDetails order={order} snapshotOnly={!saved} />;
}

function TicketDetails({ order, snapshotOnly }: {
  order: PickupOrder;
  snapshotOnly: boolean;
}) {
  const ready = order.status === "ready";
  return (
    <TicketShell>
      <div className="flex items-center gap-2 font-semibold text-primary">
        <Ticket size={19} aria-hidden="true" />
        Pickup ticket
      </div>
      <h1 className="mt-2 text-5xl font-bold tracking-tight tabular-nums">{formatTicketNumber(order)}</h1>
      <ul className="mt-4 space-y-1 break-words text-lg">
        {order.items.map(({ name, quantity }, index) => <li key={index}>{quantity} × {name}</li>)}
      </ul>

      <div className="mt-5 border-t border-border pt-5" role="status" aria-atomic="true">
        <Badge variant={order.status}>{ready ? "Ready for pickup" : statusLabels[order.status]}</Badge>
      </div>
      {ready && !snapshotOnly && (
        <div className="mt-4 flex gap-2.5 rounded-xl bg-ready-surface p-3 text-ready-ink" role="alert">
          <BellRing size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Simulated pickup alert</p>
            <p className="text-sm">Your order is ready for pickup.</p>
          </div>
        </div>
      )}

      {snapshotOnly && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          This is a preview of your order. Live pickup alerts on a second device require the shared Wi-Fi demo.
        </p>
      )}
      {!snapshotOnly && order.status === "waiting" && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Keep this ticket open. A simulated pickup alert will appear here when your order is ready.
        </p>
      )}
    </TicketShell>
  );
}
