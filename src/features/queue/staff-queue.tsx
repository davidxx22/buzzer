"use client";

import { ClipboardList } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateTicketStatus } from "./browser-store";
import { formatTicketNumber, nextStatus, statusLabels, type QueueTicket } from "./model";
import { QueueCounts } from "./queue-counts";
import { QueueError } from "./queue-feedback";
import { useQueue } from "./use-queue";

type QueueView = "active" | "collected";

export function StaffQueue() {
  const { state, refresh } = useQueue();
  const [view, setView] = useState<QueueView>("active");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState("");
  const activeFilter = useRef<HTMLButtonElement>(null);

  async function advanceTicket(ticket: QueueTicket, restoreFocus: boolean) {
    const next = nextStatus(ticket.status);
    if (!next || pendingId) return;

    setPendingId(ticket.id);
    setAnnouncement("");
    setError("");

    try {
      const updated = await updateTicketStatus(ticket.id, next);
      const label = formatTicketNumber(ticket.number);
      if (updated) {
        setAnnouncement(`${label} marked ${next}.`);
        if (next === "collected" && restoreFocus) activeFilter.current?.focus();
      } else {
        refresh();
        setError(`${label} changed in another tab. The queue has been refreshed.`);
      }
    } catch {
      setError("The update couldn’t be saved. Check your browser storage and try again.");
    } finally {
      setPendingId(null);
    }
  }

  const tickets = state.kind === "loaded" ? state.tickets : [];
  const visibleTickets = tickets.filter((ticket) => (view === "collected") === (ticket.status === "collected"));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className="text-3xl font-[760] tracking-tight sm:text-4xl">Order queue</h1>
      <p className="mt-2 max-w-lg leading-6 text-muted-foreground">Mark orders ready for pickup, then close the ticket when they’re collected.</p>

      {state.kind === "loading" && <p role="status" className="mt-6 text-muted-foreground">Loading the queue…</p>}
      {state.kind === "error" && <Card className="mt-6 p-5"><QueueError onRetry={refresh} /></Card>}
      {state.kind === "loaded" && (
        <>
          <div className="mt-6"><QueueCounts tickets={tickets} /></div>

          <Card className="mt-5">
            <div className="flex flex-wrap gap-2 border-b border-border p-3 sm:px-5">
              <Button ref={activeFilter} variant={view === "active" ? "default" : "ghost"} aria-pressed={view === "active"} onClick={() => setView("active")}>
                Active orders
              </Button>
              <Button variant={view === "collected" ? "default" : "ghost"} aria-pressed={view === "collected"} onClick={() => setView("collected")}>
                Collected orders
              </Button>
            </div>
            <p role="status" aria-atomic="true" className="sr-only">{announcement}</p>
            {error && <p role="alert" className="m-4 rounded-lg bg-danger-surface p-3 text-sm font-medium text-danger">{error}</p>}

            {visibleTickets.length ? (
              <ul aria-label={view === "active" ? "Active orders" : "Collected orders"} className="divide-y divide-border">
                {visibleTickets.map((ticket) => {
                  const label = formatTicketNumber(ticket.number);
                  const action = ticket.status === "waiting" ? "Mark ready" : "Mark collected";
                  return (
                    <li key={ticket.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3.5 sm:grid-cols-[1fr_9rem_10rem] sm:px-5">
                      <span className="text-lg font-bold tabular-nums">{label}</span>
                      <Badge variant={ticket.status}>{statusLabels[ticket.status]}</Badge>
                      {ticket.status !== "collected" && (
                        <Button
                          variant={ticket.status === "ready" ? "default" : "outline"}
                          className="col-span-2 sm:col-span-1 sm:justify-self-end"
                          aria-label={`${action} for ${label}`}
                          aria-disabled={pendingId !== null}
                          onClick={(event) => void advanceTicket(ticket, document.activeElement === event.currentTarget)}
                        >
                          {pendingId === ticket.id ? "Saving…" : action}
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <ClipboardList size={28} className="mx-auto text-primary" aria-hidden="true" />
                <p className="mt-3 font-bold">{view === "active" ? "No active orders" : "No collected orders yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {view === "active" ? "All orders in this demo queue have been collected." : "Tickets appear here once they’re marked collected."}
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
