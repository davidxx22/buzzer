import { Card } from "@/components/ui/card";
import { statusLabels, ticketStatuses, type QueueTicket } from "./model";

export function QueueCounts({ tickets }: { tickets: QueueTicket[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2 sm:gap-4">
      {ticketStatuses.map((status) => (
        <Card key={status} className="min-w-0 rounded-xl px-2 py-4 sm:p-5">
          <dt className="text-sm font-medium text-muted-foreground">{statusLabels[status]}</dt>
          <dd className="mt-1 font-display text-3xl leading-none font-semibold tabular-nums sm:text-4xl">
            {tickets.filter((ticket) => ticket.status === status).length}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
