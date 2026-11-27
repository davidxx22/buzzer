"use client";

import { BellRing, Ticket } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatTicketNumber, isOrderId, isPickupOrder, statusLabels, ticketStatuses, type PickupOrder, type TicketStatus } from "./model";
import { QueueError } from "./queue-feedback";
import { readTicketSnapshot } from "./ticket-link";
import { readTicketStatus, reportPickupTicketOpened } from "./ticket-status";
import { useQueue } from "./use-queue";

function TicketShell({ children, tone, expanded }: { children: ReactNode; tone?: TicketStatus; expanded?: boolean }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-12">
      <article
        className={cn("ticket-paper ticket-edge", expanded && "flex min-h-[min(36rem,calc(100svh-7rem))] flex-col")}
        data-tone={tone}
      >
        {children}
      </article>
    </div>
  );
}

export function TicketLoading() {
  return <TicketShell><p role="status" className="p-6 sm:p-8">Loading your ticket…</p></TicketShell>;
}

function TicketUnavailable() {
  return (
    <TicketShell>
      <div className="p-6 sm:p-8">
        <h1 className="font-display text-4xl leading-none font-semibold">Pickup ticket unavailable</h1>
        <p className="mt-3 leading-6">Ask the cashier to show the QR for your order again.</p>
      </div>
    </TicketShell>
  );
}

export function PickupTicket() {
  const params = useSearchParams();
  const id = params.get("order");
  if (!isOrderId(id)) return <TicketUnavailable />;

  const liveId = params.get("live");
  const scanId = params.get("scan");
  return (
    <OrderTicket
      key={id}
      id={id}
      snapshot={params.get("preview")}
      liveId={isOrderId(liveId) ? liveId : undefined}
      scanId={isOrderId(scanId) ? scanId : undefined}
    />
  );
}

function OrderTicket({ id, snapshot, liveId, scanId }: {
  id: string;
  snapshot: string | null;
  liveId?: string;
  scanId?: string;
}) {
  const { state, refresh } = useQueue(id);

  if (state.kind === "loading") return <TicketLoading />;
  if (state.kind === "error") {
    return <div className="mx-auto max-w-lg px-4 py-6 sm:py-12"><QueueError onRetry={refresh} /></div>;
  }

  const saved = state.tickets.find(isPickupOrder);
  if (saved) {
    const canReport = state.source === "shared" || Boolean(liveId);
    return <TicketDetails order={saved} connection="live" liveId={liveId} scanId={canReport ? scanId : undefined} />;
  }

  const order = state.source === "browser" ? readTicketSnapshot(id, snapshot) : null;
  if (!order) return <TicketUnavailable />;

  return liveId
    ? <HostedTicket key={liveId} order={order} liveId={liveId} scanId={scanId} />
    : <TicketDetails order={order} connection="snapshot" />;
}

type TicketConnection = "live" | "snapshot" | "connecting" | "unavailable";

function HostedTicket({ order, liveId, scanId }: { order: PickupOrder; liveId: string; scanId?: string }) {
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

  return <TicketDetails order={{ ...order, status: result.status }} connection={result.connection} liveId={liveId} scanId={scanId} />;
}

function TicketDetails({ order, connection, liveId, scanId }: {
  order: PickupOrder;
  connection: TicketConnection;
  liveId?: string;
  scanId?: string;
}) {
  useEffect(() => {
    if (!scanId || connection !== "live") return;
    const confirmationId = scanId;

    let active = true;
    let reporting = false;
    let reported = false;
    let attempts = 0;
    let retry: number;

    async function report() {
      if (!active || reporting || reported || document.visibilityState !== "visible" || attempts >= 3) return;

      reporting = true;
      attempts += 1;
      try {
        await reportPickupTicketOpened(order.id, confirmationId, liveId);
        reported = true;
      } catch {
        if (active && attempts < 3) retry = window.setTimeout(report, 1500);
      } finally {
        reporting = false;
      }
    }

    void report();
    document.addEventListener("visibilitychange", report);
    return () => {
      active = false;
      window.clearTimeout(retry);
      document.removeEventListener("visibilitychange", report);
    };
  }, [connection, liveId, order.id, scanId]);

  const ready = order.status === "ready";
  const statusLabel = ready ? "Ready for pickup" : statusLabels[order.status];
  const showAlert = ready && connection === "live";
  const showWaiting = order.status === "waiting" && connection === "live";
  const hasFooter = showAlert || showWaiting || connection === "snapshot" || connection === "unavailable";

  return (
    <TicketShell tone={connection === "live" ? order.status : undefined} expanded={hasFooter || connection === "connecting"}>
      <div className="flex-1 px-6 pt-6 pb-8 sm:px-8 sm:pt-8">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Ticket size={18} strokeWidth={1.75} aria-hidden="true" />
          Pickup ticket
        </p>
        <h1 className="mt-6 font-display text-[clamp(4rem,19vw,7.5rem)] leading-[0.86] font-semibold tabular-nums [overflow-wrap:anywhere]">
          {formatTicketNumber(order)}
        </h1>
        <div role="status" aria-atomic="true" className="mt-4">
          {connection === "live" ? (
            <p className="font-display text-4xl leading-[0.95] font-semibold sm:text-5xl">{statusLabel}</p>
          ) : (
            <p className="text-sm font-semibold">
              {connection === "connecting" ? "Checking live status…" : `Last known · ${statusLabel}`}
            </p>
          )}
        </div>
        <ul aria-label="Order items" className="mt-6 space-y-1 text-base leading-6 [overflow-wrap:anywhere] sm:text-lg">
          {order.items.map(({ name, quantity }, index) => <li key={index}>{quantity} × {name}</li>)}
        </ul>
      </div>
      {hasFooter && (
        <div className="ticket-seam px-6 py-5 text-sm leading-6 sm:px-8 sm:py-6">
          {showAlert && (
            <div className="flex gap-3" role="alert">
              <BellRing size={18} strokeWidth={1.75} className="mt-1 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-base font-semibold">Show this ticket at the pickup counter</p>
                <p className="mt-1">Simulated pickup alert</p>
              </div>
            </div>
          )}
          {showWaiting && <p>Keep this ticket open. A simulated pickup alert will appear here when your order is ready.</p>}
          {connection === "snapshot" && <p>This link shows a snapshot. Ask staff to reopen Show QR and scan the new code for live updates.</p>}
          {connection === "unavailable" && <p>Live updates are unavailable. Check your connection or ask staff to reopen Show QR.</p>}
        </div>
      )}
    </TicketShell>
  );
}
