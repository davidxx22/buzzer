import { statusLabels, ticketStatuses, type QueueTicket } from "./model";

export function QueueCounts({ tickets }: { tickets: QueueTicket[] }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card">
      {ticketStatuses.map((status) => (
        <div key={status} className="flex min-w-0 flex-col px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
          <dt className="text-sm text-muted-foreground">{statusLabels[status]}</dt>
          <dd className="font-mono text-2xl font-medium tabular-nums">
            {tickets.filter((ticket) => ticket.status === status).length}
          </dd>
        </div>
      ))}
    </dl>
  );
}
