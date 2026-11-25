"use client";

import { BellRing, CheckCircle2, Clock3, Ticket, TicketX } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { joinQueue } from "./browser-store";
import { countAhead, formatTicketNumber, type QueueTicket, type TicketStatus } from "./model";
import { QueueError } from "./queue-feedback";
import { useQueue } from "./use-queue";

const statusContent = {
  waiting: { title: "Waiting for your order", icon: Clock3, tone: "bg-waiting-surface text-waiting-ink" },
  ready: { title: "Your order is ready", icon: BellRing, tone: "bg-ready-surface text-ready-ink" },
  collected: { title: "Order collected", icon: CheckCircle2, tone: "bg-muted text-foreground" },
} satisfies Record<TicketStatus, { title: string; icon: typeof Clock3; tone: string }>;

function CustomerShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-lg px-4 py-8 sm:px-6 sm:py-14">{children}</div>;
}

export function CustomerQueueLoading() {
  return (
    <CustomerShell>
      <Card className="p-6 sm:p-8">
        <p role="status" className="text-muted-foreground">Loading the queue…</p>
      </Card>
    </CustomerShell>
  );
}

export function CustomerQueue() {
  const router = useRouter();
  const ticketId = useSearchParams().get("ticket");
  const { state, refresh } = useQueue();
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState(false);
  const createdTicket = useRef<string | null>(null);
  const ticketHeading = useRef<HTMLHeadingElement>(null);
  const ticket = state.kind === "loaded" ? state.tickets.find((item) => item.id === ticketId) : undefined;

  useEffect(() => {
    if (ticket && ticket.id === createdTicket.current) {
      ticketHeading.current?.focus();
      createdTicket.current = null;
      setJoining(false);
    }
  }, [ticket]);

  async function handleJoin() {
    if (joining) return;
    setJoining(true);
    setJoinError(false);

    try {
      const newTicket = await joinQueue();
      createdTicket.current = newTicket.id;
      router.replace(`/queue/?ticket=${encodeURIComponent(newTicket.id)}`);
    } catch {
      setJoining(false);
      setJoinError(true);
    }
  }

  if (state.kind === "loading") return <CustomerQueueLoading />;

  if (state.kind === "error") {
    return <CustomerShell><Card className="p-6 sm:p-8"><QueueError onRetry={refresh} /></Card></CustomerShell>;
  }

  if (ticketId !== null && !ticket) {
    return (
      <CustomerShell>
        <Card className="p-6 sm:p-8">
          <TicketX size={28} className="text-primary" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">Ticket unavailable</h1>
          <p className="mt-2 leading-6 text-muted-foreground">This demo ticket may have been cleared or created in another browser.</p>
          <Button asChild className="mt-5"><Link href="/queue">Back to the queue</Link></Button>
        </Card>
      </CustomerShell>
    );
  }

  if (!ticket) {
    return (
      <CustomerShell>
        <Card className="overflow-hidden">
          <div className="bg-primary px-6 py-8 text-primary-foreground sm:px-8 sm:py-10">
            <div className="grid size-12 place-items-center rounded-xl border border-white/30 bg-white/10">
              <Ticket size={25} aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-3xl font-[760] tracking-tight sm:text-4xl">Join the queue</h1>
            <p className="mt-3 leading-6 text-white/90">Get a ticket and check this page for your pickup alert.</p>
          </div>
          <div className="p-6 sm:p-8">
            <Button size="large" className="w-full" onClick={() => void handleJoin()} disabled={joining}>
              {joining ? "Getting your ticket…" : "Get my ticket"}
            </Button>
            {joinError && <p role="alert" className="mt-3 text-sm font-medium text-danger">Your ticket couldn’t be saved. Check your browser storage and try again.</p>}
          </div>
        </Card>
      </CustomerShell>
    );
  }

  const ahead = countAhead(state.tickets, ticket);
  const { title, icon: StatusIcon, tone } = statusContent[ticket.status];
  let detail = "Thanks for stopping by.";
  if (ticket.status === "waiting") {
    detail = ahead === 0 ? "You’re next in line." : `${ahead} ${ahead === 1 ? "ticket" : "tickets"} ahead of you.`;
  }
  if (ticket.status === "ready") detail = "Show this ticket at the pickup counter.";

  return (
    <CustomerShell>
      <Card className="overflow-hidden">
        <div className="bg-primary px-6 py-8 text-center text-primary-foreground sm:px-8 sm:py-10">
          <h1 ref={ticketHeading} tabIndex={-1} className="rounded-sm text-base font-medium text-white/90">
            Your ticket <strong className="mt-2 block text-6xl font-[780] tracking-tight tabular-nums sm:text-7xl">{formatTicketNumber(ticket.number)}</strong>
          </h1>
        </div>
        <div className="p-5 sm:p-6">
          <div role="status" aria-atomic="true" className={cn("flex items-start gap-3 rounded-xl p-4 sm:p-5", tone)}>
            <StatusIcon size={23} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">{title}</p>
              <p className="mt-1 leading-6">{detail}</p>
            </div>
          </div>
          {ticket.status === "waiting" && (
            <p className="mt-4 text-center text-sm text-muted-foreground">Keep this tab open to see updates.</p>
          )}
          {ticket.status === "collected" && (
            <Button asChild variant="outline" className="mt-4 w-full"><Link href="/queue">Join again</Link></Button>
          )}
        </div>
      </Card>
    </CustomerShell>
  );
}
