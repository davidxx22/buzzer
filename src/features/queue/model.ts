export type TicketStatus = "waiting" | "ready" | "collected";

export interface QueueTicket {
  id: string;
  number: number;
  status: TicketStatus;
}

export const statusLabels: Record<TicketStatus, string> = {
  waiting: "Waiting",
  ready: "Ready",
  collected: "Collected",
};

export function formatTicketNumber(number: number) {
  return `A-${number}`;
}

export function countAhead(queue: QueueTicket[], ticket: QueueTicket) {
  return queue.filter((item) => item.number < ticket.number && item.status === "waiting").length;
}

export function nextStatus(status: TicketStatus) {
  if (status === "waiting") return "ready";
  if (status === "ready") return "collected";
  return null;
}
