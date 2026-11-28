import { Button } from "@/components/ui/button";
import { formatTicketNumber, statusLabels, type QueueTicket } from "./model";
import { OrderTicketHeader } from "./order-ticket-header";

export function OrderDetails({ ticket, error, onEdit }: { ticket: QueueTicket; error: string; onEdit?: () => void }) {
  return (
    <div className="space-y-4">
      <OrderTicketHeader number={formatTicketNumber(ticket)}>
        <p className="font-medium">{statusLabels[ticket.status]}</p>
      </OrderTicketHeader>
      {ticket.items ? (
        <ul aria-label="Order items" className="divide-y divide-border border-b border-border">
          {ticket.items.map(({ name, quantity }, index) => (
            <li key={index} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 px-3 py-2 text-sm">
              <span className="text-end font-medium text-muted-foreground tabular-nums">{quantity} ×</span>
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
