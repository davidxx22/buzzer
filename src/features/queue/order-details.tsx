import { Button } from "@/components/ui/button";
import { formatTicketNumber, statusLabels, type QueueTicket } from "./model";

export function OrderDetails({ ticket, error, onEdit }: { ticket: QueueTicket; error: string; onEdit?: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-display text-4xl leading-none font-semibold tabular-nums">{formatTicketNumber(ticket)}</p>
        <p className="text-sm font-medium text-muted-foreground">{statusLabels[ticket.status]}</p>
      </div>
      {ticket.items ? (
        <ul aria-label="Order items" className="divide-y divide-border rounded-lg border border-border">
          {ticket.items.map(({ name, quantity }, index) => (
            <li key={index} className="flex gap-3 px-4 py-3 text-sm">
              <span className="shrink-0 font-semibold tabular-nums">{quantity} ×</span>
              <span className="min-w-0 [overflow-wrap:anywhere]">{name}</span>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted-foreground">No order items were saved with this ticket.</p>}
      {ticket.notes && (
        <div className="text-sm">
          <h3 className="font-semibold">Notes</h3>
          <p className="mt-1 whitespace-pre-wrap text-muted-foreground [overflow-wrap:anywhere]">{ticket.notes}</p>
        </div>
      )}
      {error && <p role="alert" className="rounded-lg bg-danger-surface p-3 text-sm text-danger">{error}</p>}
      {onEdit && <div className="flex justify-end"><Button onClick={onEdit}>Edit order</Button></div>}
    </div>
  );
}
