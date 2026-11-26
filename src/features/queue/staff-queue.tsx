"use client";

import { ClipboardList, Plus, QrCode } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatTicketNumber, isPickupOrder, nextStatus, orderSummary, statusLabels, type OrderDetails, type OrderSource, type PickupOrder, type QueueTicket } from "./model";
import { OrderForm } from "./order-form";
import { OrderQr } from "./order-qr";
import { advanceOrder, createOrder } from "./order-store";
import { QueueCounts } from "./queue-counts";
import { QueueError } from "./queue-feedback";
import { useQueue } from "./use-queue";

type QueueView = "active" | "collected";
type QueueDialog = { kind: "create" } | { kind: "qr"; order: PickupOrder; source: OrderSource };

export function StaffQueue() {
  const { state, refresh } = useQueue();
  const [view, setView] = useState<QueueView>("active");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<QueueDialog | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const activeFilter = useRef<HTMLButtonElement>(null);

  async function advanceTicket(ticket: QueueTicket, restoreFocus: boolean) {
    const next = nextStatus(ticket.status);
    if (!next || pendingId) return;

    setPendingId(ticket.id);
    setAnnouncement("");
    setError("");

    try {
      const updated = await advanceOrder(ticket.id, next);
      const label = formatTicketNumber(ticket);
      if (updated) {
        setAnnouncement(`${label} marked ${next}.`);
        if (next === "collected" && restoreFocus) activeFilter.current?.focus();
      } else {
        setError(`${label} already changed. The queue has been refreshed.`);
      }
      await refresh();
    } catch {
      setError("The update couldn’t be saved. Check your connection or browser storage and try again.");
    } finally {
      setPendingId(null);
    }
  }

  async function submitOrder(id: string, details: OrderDetails) {
    if (isCreating || state.kind !== "loaded") return;
    setIsCreating(true);
    setCreateError("");
    try {
      const order = await createOrder(id, details);
      setView("active");
      setAnnouncement(`Order ${formatTicketNumber(order)} created.`);
      setDialog({ kind: "qr", order, source: state.source });
      await refresh();
    } catch {
      setCreateError("The order couldn’t be saved. Check your connection or browser storage and try again.");
    } finally {
      setIsCreating(false);
    }
  }

  const tickets = state.kind === "loaded" ? state.tickets : [];
  const visibleTickets = tickets.filter((ticket) => (view === "collected") === (ticket.status === "collected"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h1 className="text-[2rem] leading-tight font-medium tracking-tight sm:text-4xl">Order queue</h1>
        <Button type="button" disabled={state.kind !== "loaded"} onClick={() => {
          setCreateError("");
          setDialog({ kind: "create" });
        }}>
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          New order
        </Button>
      </div>
      <p className="mt-2 max-w-lg leading-6 text-muted-foreground">Create pickup tickets and mark orders ready or collected</p>

      {state.kind === "loading" && <p role="status" className="mt-6 text-muted-foreground">Loading the queue…</p>}
      {state.kind === "error" && <Card className="mt-6 p-5"><QueueError onRetry={refresh} /></Card>}
      {state.kind === "loaded" && (
        <>
          <div className="mt-6"><QueueCounts tickets={tickets} /></div>

          <Card className="mt-5">
            <div className="flex flex-wrap gap-2 border-b border-border p-3">
              <Button ref={activeFilter} variant="ghost" className="aria-pressed:bg-muted aria-pressed:text-foreground" aria-pressed={view === "active"} onClick={() => setView("active")}>
                Active orders
              </Button>
              <Button variant="ghost" className="aria-pressed:bg-muted aria-pressed:text-foreground" aria-pressed={view === "collected"} onClick={() => setView("collected")}>
                Collected orders
              </Button>
            </div>
            <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
            {error && <p role="alert" className="m-4 rounded-lg bg-danger-surface p-3 text-sm font-medium text-danger">{error}</p>}

            {visibleTickets.length ? (
              <ul aria-label={view === "active" ? "Active orders" : "Collected orders"} className="divide-y divide-border">
                {visibleTickets.map((ticket) => {
                  const label = formatTicketNumber(ticket);
                  const action = ticket.status === "waiting" ? "Mark ready" : "Mark collected";
                  return (
                    <li key={ticket.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_6rem_16rem] sm:px-5">
                      <div className="min-w-0">
                        <p className="font-mono text-lg font-semibold tabular-nums">{label}</p>
                        {ticket.items && <p className="mt-1 break-words text-sm text-muted-foreground">{orderSummary(ticket.items)}</p>}
                        {ticket.notes && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{ticket.notes}</p>}
                      </div>
                      <Badge variant={ticket.status}>{statusLabels[ticket.status]}</Badge>
                      <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1">
                        {isPickupOrder(ticket) && (
                          <Button variant="ghost" className="col-start-1 row-start-1 px-2" aria-label={`Show QR for ${label}`} onClick={() => setDialog({ kind: "qr", order: ticket, source: state.source })}>
                            <QrCode size={16} strokeWidth={1.5} aria-hidden="true" />
                            Show QR
                          </Button>
                        )}
                        {ticket.status !== "collected" && (
                          <Button
                            variant="outline"
                            className="col-start-2 row-start-1 px-2"
                            aria-label={`${action} for ${label}`}
                            aria-disabled={pendingId !== null}
                            onClick={(event) => void advanceTicket(ticket, document.activeElement === event.currentTarget)}
                          >
                            {pendingId === ticket.id ? "Saving…" : action}
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <ClipboardList size={16} strokeWidth={1.5} className="mx-auto text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-medium">{view === "active" ? "No active orders" : "No collected orders yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {view === "active" ? "Select New order to add a pickup ticket" : "Tickets appear here once they’re marked collected"}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
      {dialog && (
        <Dialog title={dialog.kind === "create" ? "New order" : "Pickup QR"} busy={isCreating} onDismiss={() => setDialog(null)}>
          {dialog.kind === "create" ? (
            <OrderForm busy={isCreating} error={createError} onCreate={(id, details) => void submitOrder(id, details)} />
          ) : (
            <OrderQr order={dialog.order} source={dialog.source} />
          )}
        </Dialog>
      )}
    </div>
  );
}
