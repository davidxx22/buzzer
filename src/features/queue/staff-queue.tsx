"use client";

import { ClipboardList, Plus, QrCode } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { TicketTimer } from "./ticket-timer";
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
  const [now, setNow] = useState<number | null>(null);
  const activeFilter = useRef<HTMLButtonElement>(null);
  const orderDialog = useRef<HTMLDialogElement>(null);

  const closeOrderDialog = useCallback(() => {
    orderDialog.current?.close();
  }, []);

  async function advanceTicket(ticket: QueueTicket, trigger: HTMLButtonElement) {
    const next = nextStatus(ticket.status);
    if (!next || pendingId) return;

    const restoreFocus = document.activeElement === trigger;
    setPendingId(ticket.id);
    setAnnouncement("");
    setError("");

    try {
      const updated = await advanceOrder(ticket.id, next);
      const label = formatTicketNumber(ticket);
      if (updated) {
        setAnnouncement(`${label} marked ${next}.`);
        if (restoreFocus && (document.activeElement === trigger || document.activeElement === document.body)) {
          activeFilter.current?.focus();
        }
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
  const hasActiveTimers = view === "active" && tickets.some((ticket) => ticket.status !== "collected" && ticket.statusStartedAt !== undefined);

  useEffect(() => {
    if (!hasActiveTimers) return;
    const tick = () => setNow(Date.now());
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [hasActiveTimers]);

  const sections = view === "active"
    ? [
        { label: "Ready for pickup", status: "ready" },
        { label: "Waiting orders", status: "waiting" },
      ]
    : [{ label: "Collected orders", status: "collected" }];
  const visibleSections = sections
    .map(({ label, status }) => ({ label, orders: tickets.filter((ticket) => ticket.status === status) }))
    .filter(({ orders }) => orders.length > 0);

  return (
    <Card className="mx-auto my-8 w-[calc(100%-2rem)] max-w-[68rem] border-0 p-3 shadow-lg shadow-black/10 sm:my-12 sm:w-[calc(100%-4rem)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl leading-none font-semibold sm:text-6xl">Order queue</h1>
          <p className="mt-2 max-w-lg leading-6 text-muted-foreground">Mark orders ready for pickup, then close each ticket when it’s collected.</p>
        </div>
        <Button type="button" disabled={state.kind !== "loaded"} onClick={() => {
          setCreateError("");
          setDialog({ kind: "create" });
        }}>
          <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          New order
        </Button>
      </div>

      {state.kind === "loading" && <p role="status" className="mt-6 text-muted-foreground">Loading the queue…</p>}
      {state.kind === "error" && <div className="mt-6"><QueueError onRetry={refresh} /></div>}
      {state.kind === "loaded" && (
        <>
          <div className="mt-6"><QueueCounts tickets={tickets} /></div>

          <div className="mt-6 border-t border-border pt-4">
            <div className="mb-4 flex flex-wrap gap-2">
              <Button ref={activeFilter} variant={view === "active" ? "default" : "ghost"} aria-pressed={view === "active"} onClick={() => setView("active")}>
                Active orders
              </Button>
              <Button variant={view === "collected" ? "default" : "ghost"} aria-pressed={view === "collected"} onClick={() => setView("collected")}>
                Collected orders
              </Button>
            </div>
            <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
            {error && <p role="alert" className="mb-4 rounded-lg bg-danger-surface p-3 text-sm font-medium text-danger">{error}</p>}

            {visibleSections.length ? (
              <div className="grid gap-5 sm:gap-6">
                {visibleSections.map(({ label: sectionLabel, orders }) => (
                  <div key={sectionLabel}>
                    {view === "active" && (
                      <h2 className="mb-2 text-sm font-semibold">
                        {sectionLabel}
                      </h2>
                    )}
                    <ul aria-label={sectionLabel} className="grid gap-2">
                      {orders.map((ticket) => {
                        const number = formatTicketNumber(ticket).replace(/^#/, "");
                        const label = `No. ${number}`;
                        const action = ticket.status === "waiting" ? "Mark ready" : "Mark collected";
                        return (
                          <li key={ticket.id} className="staff-ticket grid overflow-hidden rounded-r-lg border border-l-0 border-border bg-background md:items-center">
                            <div className="ticket-paper staff-ticket-number row-span-2 grid content-center gap-px self-stretch px-2 py-3 text-center md:row-span-1" data-tone={ticket.status}>
                              <span className="text-xs leading-none font-semibold">No.</span>
                              <span className="font-display text-[2.125rem] leading-none font-semibold tabular-nums [overflow-wrap:anywhere] md:text-[2.5rem]">{number}</span>
                            </div>
                            <div className="flex min-w-0 justify-between gap-2 px-3 pt-3 md:gap-4 md:px-4 md:pb-3">
                              <div className="min-w-0 self-center">
                                {ticket.status === "collected" && <Badge variant="collected">{statusLabels.collected}</Badge>}
                                {ticket.items && <p className="text-sm leading-5 text-foreground not-first:mt-2 [overflow-wrap:anywhere]">{orderSummary(ticket.items)}</p>}
                                {ticket.notes && <p className="text-sm leading-5 whitespace-pre-wrap text-muted-foreground not-first:mt-1 [overflow-wrap:anywhere]">{ticket.notes}</p>}
                              </div>
                              <TicketTimer ticket={ticket} now={now} />
                            </div>
                            <div className="col-start-2 flex flex-wrap items-center gap-2 px-3 py-3 md:col-start-auto md:justify-end md:px-4">
                              {isPickupOrder(ticket) && (
                                <Button variant="outline" aria-label={`Show QR for ${label}`} onClick={() => setDialog({ kind: "qr", order: ticket, source: state.source })}>
                                  <QrCode size={18} strokeWidth={1.75} aria-hidden="true" />
                                  Show QR
                                </Button>
                              )}
                              {ticket.status !== "collected" && (
                                <Button
                                  aria-label={`${action} for ${label}`}
                                  aria-disabled={pendingId !== null}
                                  onClick={(event) => void advanceTicket(ticket, event.currentTarget)}
                                >
                                  {pendingId === ticket.id ? "Saving…" : action}
                                </Button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-background px-6 py-10 text-center">
                <ClipboardList size={20} strokeWidth={1.75} className="mx-auto text-primary" aria-hidden="true" />
                <p className="mt-3 font-bold">{view === "active" ? "No active orders" : "No collected orders yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {view === "active" ? "Select New order to add a pickup ticket." : "Tickets appear here once they’re marked collected."}
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {dialog && (
        <Dialog title={dialog.kind === "create" ? "New order" : "Pickup QR"} busy={isCreating} onDismiss={() => setDialog(null)} dialogRef={orderDialog}>
          {dialog.kind === "create" ? (
            <OrderForm busy={isCreating} error={createError} onCreate={(id, details) => void submitOrder(id, details)} />
          ) : (
            <OrderQr order={dialog.order} source={dialog.source} onClose={closeOrderDialog} />
          )}
        </Dialog>
      )}
    </Card>
  );
}
