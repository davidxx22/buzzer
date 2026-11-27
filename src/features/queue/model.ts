import { isOrderId, isOrderItems, isTicketStatus, orderLimits, ticketStatuses } from "./ticket-rules.mjs";

export { isOrderId, isOrderItems, isTicketStatus, orderLimits, ticketStatuses };
export type TicketStatus = (typeof ticketStatuses)[number];

export type OrderItem = { name: string; quantity: number };
export type OrderDetails = { items: OrderItem[]; notes: string };

export interface QueueTicket {
  id: string;
  number: number;
  status: TicketStatus;
  statusStartedAt?: number;
  revision?: number;
  items?: OrderItem[];
  notes?: string;
}

export type PickupOrder = QueueTicket & OrderDetails;
export type OrderSource = "browser" | "shared";

export const ordersEndpoint = "/api/orders/";
export const ticketStatusEndpoint = "/api/ticket-status";

export const statusLabels: Record<TicketStatus, string> = {
  waiting: "Waiting",
  ready: "Ready",
  collected: "Collected",
};

export function formatTicketNumber(ticket: QueueTicket) {
  return isPickupOrder(ticket) ? `#${String(ticket.number).padStart(2, "0")}` : `A-${ticket.number}`;
}

export function orderSummary(items: OrderItem[]) {
  return items.map(({ name, quantity }) => `${quantity} × ${name}`).join(" · ");
}

export function isOrderDetails(value: unknown): value is OrderDetails {
  if (!value || typeof value !== "object") return false;

  const { items, notes } = value as Partial<OrderDetails>;
  return isOrderItems(items) &&
    typeof notes === "string" && notes.length <= orderLimits.notes;
}

export function isQueueTicket(value: unknown): value is QueueTicket {
  if (!value || typeof value !== "object") return false;

  const { id, number, status, statusStartedAt, revision, items, notes } = value as Partial<QueueTicket>;
  return typeof id === "string" && id.length > 0 &&
    typeof number === "number" && Number.isSafeInteger(number) && number > 0 &&
    isTicketStatus(status) &&
    (statusStartedAt === undefined || Number.isSafeInteger(statusStartedAt) && statusStartedAt >= 0) &&
    (revision === undefined || Number.isSafeInteger(revision) && revision >= 0) &&
    (items === undefined && notes === undefined || isOrderId(id) && isOrderDetails(value));
}

export function isPickupOrder(ticket: QueueTicket): ticket is PickupOrder {
  return ticket.items !== undefined && ticket.notes !== undefined;
}

export function newPickupOrder(queue: QueueTicket[], id: string, details: OrderDetails): PickupOrder {
  const lastNumber = queue.reduce((last, ticket) => isPickupOrder(ticket) ? Math.max(last, ticket.number) : last, 0);
  return { ...details, id, number: lastNumber + 1, status: "waiting", statusStartedAt: Date.now() };
}

export function nextStatus(status: TicketStatus) {
  if (status === "waiting") return "ready";
  if (status === "ready") return "collected";
  return null;
}

export function transitionTicket(ticket: QueueTicket, status: TicketStatus): QueueTicket | null {
  if (nextStatus(ticket.status) !== status) return null;
  return { ...ticket, status, statusStartedAt: Date.now() };
}

export function reviseWaitingOrder(ticket: QueueTicket, revision: number, details: OrderDetails): PickupOrder | null {
  if (ticket.status !== "waiting" || !isPickupOrder(ticket) || (ticket.revision ?? 0) !== revision || !isOrderDetails(details)) return null;

  return {
    ...ticket,
    items: details.items.map(({ name, quantity }) => ({ name: name.trim(), quantity })),
    notes: details.notes.trim(),
    revision: revision + 1,
  };
}
