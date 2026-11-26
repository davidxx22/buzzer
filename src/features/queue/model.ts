import { isOrderId, isTicketStatus, ticketStatuses } from "./ticket-rules.mjs";

export { isOrderId, isTicketStatus, ticketStatuses };
export type TicketStatus = (typeof ticketStatuses)[number];

export type OrderItem = { name: string; quantity: number };
export type OrderDetails = { items: OrderItem[]; notes: string };

export interface QueueTicket {
  id: string;
  number: number;
  status: TicketStatus;
  items?: OrderItem[];
  notes?: string;
}

export type PickupOrder = QueueTicket & OrderDetails;
export type OrderSource = "browser" | "shared";

export const orderLimits = { items: 8, name: 60, quantity: 99, notes: 240 };
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
  return Array.isArray(items) && items.length > 0 && items.length <= orderLimits.items &&
    items.every((item) => item && typeof item.name === "string" && item.name.trim().length > 0 &&
      item.name.length <= orderLimits.name && !/[\x00-\x1f\x7f]/.test(item.name) &&
      Number.isSafeInteger(item.quantity) && item.quantity >= 1 && item.quantity <= orderLimits.quantity) &&
    typeof notes === "string" && notes.length <= orderLimits.notes;
}

export function isQueueTicket(value: unknown): value is QueueTicket {
  if (!value || typeof value !== "object") return false;

  const { id, number, status, items, notes } = value as Partial<QueueTicket>;
  return typeof id === "string" && id.length > 0 &&
    typeof number === "number" && Number.isSafeInteger(number) && number > 0 &&
    isTicketStatus(status) &&
    (items === undefined && notes === undefined || isOrderId(id) && isOrderDetails(value));
}

export function isPickupOrder(ticket: QueueTicket): ticket is PickupOrder {
  return ticket.items !== undefined && ticket.notes !== undefined;
}

export function newPickupOrder(queue: QueueTicket[], id: string, details: OrderDetails): PickupOrder {
  const lastNumber = queue.reduce((last, ticket) => isPickupOrder(ticket) ? Math.max(last, ticket.number) : last, 0);
  return { ...details, id, number: lastNumber + 1, status: "waiting" };
}

export function nextStatus(status: TicketStatus) {
  if (status === "waiting") return "ready";
  if (status === "ready") return "collected";
  return null;
}
