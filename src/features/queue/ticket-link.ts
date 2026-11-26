import { isPickupOrder, isQueueTicket, type OrderSource, type PickupOrder } from "./model";

export function getTicketUrl(order: PickupOrder, source: OrderSource, liveId?: string | null) {
  const url = new URL("/ticket/", window.location.origin);
  url.searchParams.set("order", order.id);
  if (source === "browser") {
    const snapshot = { number: order.number, items: order.items, status: order.status };
    const bytes = new TextEncoder().encode(JSON.stringify(snapshot));
    const encoded = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    url.searchParams.set("preview", encoded);
    if (liveId) url.searchParams.set("live", liveId);
  }
  return url;
}

export function readTicketSnapshot(id: string, encoded: string | null): PickupOrder | null {
  if (!encoded || encoded.length > 3000) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0));
    const data = JSON.parse(new TextDecoder().decode(bytes));
    const ticket = { id, number: data.number, items: data.items, status: data.status, notes: "" };
    return isQueueTicket(ticket) && isPickupOrder(ticket) ? ticket : null;
  } catch {
    return null;
  }
}
