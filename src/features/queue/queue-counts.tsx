import { BellRing, CheckCircle2, Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { statusLabels, type QueueTicket } from "./model";

const queueMetrics = [
  { status: "waiting", icon: Clock3 },
  { status: "ready", icon: BellRing },
  { status: "collected", icon: CheckCircle2 },
] as const;

export function QueueCounts({ tickets }: { tickets: QueueTicket[] }) {
  return (
    <dl className="grid grid-cols-3 gap-2.5 sm:gap-4">
      {queueMetrics.map(({ status, icon: Icon }) => (
        <Card key={status} className="min-w-0 px-2.5 py-3.5 sm:p-5">
          <dt className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon size={16} className="hidden shrink-0 text-primary sm:block" aria-hidden="true" />
            {statusLabels[status]}
          </dt>
          <dd className="mt-1 text-2xl font-bold tabular-nums sm:mt-2 sm:text-3xl">
            {tickets.filter((ticket) => ticket.status === status).length}
          </dd>
        </Card>
      ))}
    </dl>
  );
}
