import { isOrderId, isTicketStatus, ticketStatusEndpoint, type TicketStatus } from "./model";

function postTicketRequest(body: Record<string, string | undefined>, secret?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (secret) headers.set("Authorization", `Bearer ${secret}`);
  return fetch(ticketStatusEndpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
}

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

export async function publishTicketStatus(orderId: string, secret: string, status: TicketStatus, allowPreview = false, scanId?: string) {
  const response = await postTicketRequest({ orderId, status, scanId }, secret);
  if (response.status === 404 && allowPreview) return null;
  if (!response.ok) throw new Error("The live ticket status couldn’t be saved.");

  const { id } = await response.json();
  if (!isOrderId(id)) throw new Error("The live ticket link is invalid.");
  return id;
}

export async function prepareSharedPickupQr(orderId: string, scanId: string) {
  const response = await postTicketRequest({ action: "prepare-qr", orderId, scanId });
  return response.ok;
}

export async function reportPickupTicketOpened(orderId: string, scanId: string, liveId?: string) {
  const response = await postTicketRequest({ action: "qr-opened", orderId, scanId, liveId });
  if (!response.ok && response.status !== 404) throw new Error("Couldn’t confirm that the ticket was opened.");
}

export async function isPickupTicketOpened(orderId: string, scanId: string, liveId?: string) {
  const params = new URLSearchParams({ order: orderId, scan: scanId });
  if (liveId) params.set("id", liveId);
  const response = await fetch(`${ticketStatusEndpoint}?${params}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return false;
  const { opened } = await response.json();
  return opened === true;
}
