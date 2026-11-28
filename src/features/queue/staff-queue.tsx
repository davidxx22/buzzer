"use client";

import { ClipboardList, Plus, QrCode } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CollectedSortMenu, type CollectedSort } from "./collected-sort-menu";
import { formatTicketNumber, isPickupOrder, nextStatus, type OrderDetails as OrderDetailsData, type OrderSource, type PickupOrder, type QueueTicket } from "./model";
import { OrderDetails } from "./order-details";
import { OrderForm } from "./order-form";
import { OrderQr } from "./order-qr";
import { advanceOrder, createOrder, editOrder } from "./order-store";
import { QueueCounts } from "./queue-counts";
import { EmptyActiveQueue, QueueError } from "./queue-feedback";
import { TicketTimer } from "./ticket-timer";
import { useQueue } from "./use-queue";

type QueueView = "active" | "collected";
type QueueDialog =
  | { kind: "create" }
  | { kind: "qr"; order: PickupOrder; source: OrderSource }
  | { kind: "details"; ticket: QueueTicket }
  | { kind: "edit"; order: PickupOrder };

export function StaffQueue() {
  const { state, refresh } = useQueue();
  const [view, setView] = useState<QueueView>("active");
  const [collectedSort, setCollectedSort] = useState<CollectedSort>("latest");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<QueueDialog | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const activeFilter = useRef<HTMLButtonElement>(null);
  const newOrderButton = useRef<HTMLButtonElement>(null);
  const createOrderTrigger = useRef<HTMLButtonElement>(null);
  const orderDialog = useRef<HTMLDialogElement>(null);

  function openNewOrder(event: MouseEvent<HTMLButtonElement>) {
    createOrderTrigger.current = event.currentTarget;
    setFormError("");
    setDialog({ kind: "create" });
  }

  function dismissOrderDialog() {
    const trigger = createOrderTrigger.current;
    createOrderTrigger.current = null;
    setDialog(null);
    if (trigger && !trigger.isConnected) newOrderButton.current?.focus();
  }

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

  async function submitOrder(id: string, details: OrderDetailsData) {
    if (isSaving || state.kind !== "loaded") return;
    setIsSaving(true);
    setFormError("");
    try {
      if (dialog?.kind === "edit") {
        const updated = await editOrder(id, dialog.order.revision ?? 0, details);
        await refresh();
        if (updated) {
          setAnnouncement(`Order ${formatTicketNumber(updated)} updated.`);
          setDialog({ kind: "details", ticket: updated });
        } else {
          setFormError("This order changed while you were editing. Review the latest details before trying again.");
          setDialog({ kind: "details", ticket: dialog.order });
        }
        return;
      }

      const order = await createOrder(id, details);
      setView("active");
      setAnnouncement(`Order ${formatTicketNumber(order)} created.`);
      setDialog({ kind: "qr", order, source: state.source });
      await refresh();
    } catch {
      setFormError("The order couldn’t be saved. Check your connection or browser storage and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const tickets = state.kind === "loaded" ? state.tickets : [];
  const selectedTicket = dialog?.kind === "details" ? tickets.find(({ id }) => id === dialog.ticket.id) : undefined;
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
    .map(({ label, status }) => {
      const orders = tickets.filter((ticket) => ticket.status === status);
      if (status === "collected") {
        orders.sort((a, b) => collectedSort === "number"
          ? a.number - b.number
          : (b.statusStartedAt ?? -1) - (a.statusStartedAt ?? -1) || b.number - a.number);
      }
      return { label, orders };
    })
    .filter(({ orders }) => orders.length > 0);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 sm:mt-8">
        <div>
          <h1 className="font-display text-5xl leading-none font-semibold sm:text-6xl">Order queue</h1>
          <p className="mt-2 max-w-lg leading-6 text-muted-foreground">Mark orders ready for pickup, then close each ticket when it’s collected.</p>
        </div>
        <Button ref={newOrderButton} type="button" disabled={state.kind !== "loaded"} onClick={openNewOrder}>
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-1 sm:gap-2">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Button ref={activeFilter} className="px-3 max-[360px]:px-2 max-[360px]:text-xs sm:px-4" variant={view === "active" ? "default" : "ghost"} aria-pressed={view === "active"} onClick={() => setView("active")}>
                  Active orders
                </Button>
                <Button className="px-3 max-[360px]:px-2 max-[360px]:text-xs sm:px-4" variant={view === "collected" ? "default" : "ghost"} aria-pressed={view === "collected"} onClick={() => setView("collected")}>
                  Collected orders
                </Button>
              </div>
              {view === "collected" && visibleSections.length > 0 && (
                <CollectedSortMenu value={collectedSort} onChange={setCollectedSort} />
              )}
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
                        const action = ticket.status === "waiting" ? "Notify" : "Collected";
                        return (
                          <li key={ticket.id} className="staff-ticket grid overflow-hidden rounded-r-lg border border-l-0 border-border bg-card md:items-center">
                            <div
                              className="ticket-paper staff-ticket-number row-span-2 grid content-center gap-px self-stretch px-2 py-4 text-center md:row-span-1"
                              data-tone={ticket.status}
                            >
                              <span className="text-xs leading-none font-semibold">No.</span>
                              <span className="font-display text-[2.5rem] leading-none font-semibold tabular-nums [overflow-wrap:anywhere] md:text-[2.75rem]">{number}</span>
                            </div>
                            {ticket.status !== "collected" && (
                              <div className="flex min-w-0 justify-between gap-2 px-3 pt-3 md:gap-4 md:px-4 md:pb-3">
                                <div className="min-w-0 self-center">
                                  {ticket.notes && <p className="text-sm leading-5 whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]">{ticket.notes}</p>}
                                </div>
                                <TicketTimer ticket={ticket} now={now} />
                              </div>
                            )}
                            <div className="col-start-2 flex flex-wrap items-center gap-2 px-3 py-4 md:col-start-3 md:justify-end md:px-4">
                              {isPickupOrder(ticket) && (
                                <Button
                                  variant="outline"
                                  className="size-11 shrink-0 px-0"
                                  aria-label={`Show QR for ${label}`}
                                  title="Show pickup QR"
                                  onClick={() => setDialog({ kind: "qr", order: ticket, source: state.source })}
                                >
                                  <QrCode size={18} aria-hidden="true" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                className="px-2 sm:px-4"
                                aria-label={`Details for ${label}`}
                                onClick={() => {
                                  setFormError("");
                                  setDialog({ kind: "details", ticket });
                                }}
                              >
                                Details
                              </Button>
                              {ticket.status !== "collected" && (
                                <Button
                                  className="w-24"
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
            ) : view === "active" ? (
              <EmptyActiveQueue onNewOrder={openNewOrder} />
            ) : (
              <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
                <ClipboardList size={20} strokeWidth={1.75} className="mx-auto text-primary" aria-hidden="true" />
                <p className="mt-3 font-bold">No collected orders yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tickets appear here once they’re marked collected.
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {dialog && (
        <Dialog title={dialogTitles[dialog.kind]} busy={isSaving} onDismiss={dismissOrderDialog} dialogRef={orderDialog}>
          {(dialog.kind === "create" || dialog.kind === "edit") && (
            <OrderForm
              order={dialog.kind === "edit" ? dialog.order : undefined}
              busy={isSaving}
              error={formError}
              onSave={(id, details) => void submitOrder(id, details)}
              onCancel={dialog.kind === "edit" ? () => {
                setFormError("");
                setDialog({ kind: "details", ticket: dialog.order });
              } : undefined}
            />
          )}
          {dialog.kind === "qr" && <OrderQr order={dialog.order} source={dialog.source} onClose={closeOrderDialog} />}
          {dialog.kind === "details" && (
            <OrderDetails
              ticket={selectedTicket ?? dialog.ticket}
              error={formError}
              onEdit={selectedTicket?.status === "waiting" && isPickupOrder(selectedTicket) ? () => {
                setFormError("");
                setDialog({ kind: "edit", order: selectedTicket });
              } : undefined}
            />
          )}
        </Dialog>
      )}
    </>
  );
}

const dialogTitles: Record<QueueDialog["kind"], string> = {
  create: "New order",
  qr: "Pickup QR",
  details: "Order details",
  edit: "Edit order",
};
