"use client";

import { BellRing, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTicketNumber, isOrderId, isPickupOrder, statusLabels, ticketStatuses, type PickupOrder, type TicketStatus } from "./model";
import { QueueError } from "./queue-feedback";
import { readTicketSnapshot } from "./ticket-link";
import { readTicketStatus } from "./ticket-status";
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
      <h1 className="text-xl font-medium">Pickup ticket unavailable</h1>
      <p className="mt-2 leading-6 text-muted-foreground">Ask the cashier to show the QR for your order again.</p>
    </TicketShell>
  );
}

export function PickupTicket() {
  const params = useSearchParams();
  const id = params.get("order");
  if (!isOrderId(id)) return <TicketUnavailable />;

  const liveId = params.get("live");
  return <OrderTicket key={id} id={id} snapshot={params.get("preview")} liveId={isOrderId(liveId) ? liveId : null} />;
}

function OrderTicket({ id, snapshot, liveId }: { id: string; snapshot: string | null; liveId: string | null }) {
  const { state, refresh } = useQueue(id);

  if (state.kind === "loading") return <TicketLoading />;
  if (state.kind === "error") return <TicketShell><QueueError onRetry={refresh} /></TicketShell>;

  const saved = state.tickets.find(isPickupOrder);
  if (saved) return <TicketDetails order={saved} connection="live" />;

  const order = state.source === "browser" ? readTicketSnapshot(id, snapshot) : null;
  if (!order) return <TicketUnavailable />;

  return liveId
    ? <HostedTicket key={liveId} order={order} liveId={liveId} />
    : <TicketDetails order={order} connection="snapshot" />;
}

type TicketConnection = "live" | "snapshot" | "connecting" | "unavailable";

function HostedTicket({ order, liveId }: { order: PickupOrder; liveId: string }) {
  const [result, setResult] = useState<{ status: TicketStatus; connection: TicketConnection }>({
    status: order.status,
    connection: "connecting",
  });

  useEffect(() => {
    let active = true;
    let inFlight = false;
    let collected = false;
    async function poll() {
      if (!active || document.hidden || inFlight || collected) return;
      inFlight = true;
      try {
        const status = await readTicketStatus(order.id, liveId);
        if (!active) return;
        collected = status === "collected";
        setResult((previous) => ({
          status: ticketStatuses.indexOf(status) >= ticketStatuses.indexOf(previous.status) ? status : previous.status,
          connection: "live",
        }));
      } catch {
        if (active) setResult((previous) => ({ ...previous, connection: "unavailable" }));
      } finally {
        inFlight = false;
      }
    }

    void poll();
    const interval = window.setInterval(poll, 2500);
    document.addEventListener("visibilitychange", poll);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [liveId, order.id]);

  return <TicketDetails order={{ ...order, status: result.status }} connection={result.connection} />;
}

function TicketDetails({ order, connection }: {
  order: PickupOrder;
  connection: TicketConnection;
}) {
  const ready = order.status === "ready";
  const statusLabel = ready ? "Ready for pickup" : statusLabels[order.status];
  return (
    <TicketShell>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Ticket size={16} strokeWidth={1.5} aria-hidden="true" />
        Pickup ticket
      </div>
      <h1 className="mt-3 font-mono text-6xl leading-none font-semibold tabular-nums tracking-tight">{formatTicketNumber(order)}</h1>
      <ul className="mt-4 space-y-1 break-words text-base leading-6">
        {order.items.map(({ name, quantity }, index) => <li key={index}>{quantity} × {name}</li>)}
      </ul>

      <div className="pickup-divider mt-5 pt-4" role="status" aria-atomic="true">
        {connection === "connecting"
          ? <p className="text-sm text-muted-foreground">Checking live status…</p>
          : <Badge variant={order.status}>{connection === "live" ? statusLabel : `Last known · ${statusLabel}`}</Badge>}
      </div>
      {ready && connection === "live" && (
        <div className="mt-4 flex gap-2 rounded-lg bg-ready-surface p-3 text-ready-ink" role="alert">
          <BellRing size={16} strokeWidth={1.5} className="mt-1 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Show this ticket at the pickup counter</p>
            <p className="mt-1 text-xs">Simulated pickup alert</p>
          </div>
        </div>
      )}

      {connection === "snapshot" && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          This link shows a snapshot. Ask staff to reopen Show QR and scan the new code for live updates.
        </p>
      )}
      {connection === "unavailable" && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Live updates are unavailable. Check your connection or ask staff to reopen Show QR.
        </p>
      )}
      {connection === "live" && order.status === "waiting" && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          Keep this ticket open. A simulated pickup alert will appear here when your order is ready.
        </p>
      )}
    </TicketShell>
  );
}
