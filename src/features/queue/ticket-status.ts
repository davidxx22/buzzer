import { isOrderId, isTicketStatus, ticketStatusEndpoint, type TicketStatus } from "./model";

export async function readTicketStatus(orderId: string, id: string): Promise<TicketStatus> {
  const response = await fetch(`${ticketStatusEndpoint}?order=${orderId}&id=${id}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("The live ticket status is unavailable.");

  const { status } = await response.json();
  if (!isTicketStatus(status)) throw new Error("The live ticket status is invalid.");
  return status;
}

export async function publishTicketStatus(orderId: string, secret: string, status: TicketStatus, allowPreview = false) {
  const response = await fetch(ticketStatusEndpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (response.status === 404 && allowPreview) return null;
  if (!response.ok) throw new Error("The live ticket status couldn’t be saved.");

  const { id } = await response.json();
  if (!isOrderId(id)) throw new Error("The live ticket link is invalid.");
  return id;
}
