import { createBrowserOrder, readQueue, updateTicketStatus } from "./browser-store";
import { ordersEndpoint, type OrderDetails, type OrderSource, type PickupOrder, type QueueTicket, type TicketStatus } from "./model";

let sourceRequest: Promise<OrderSource> | undefined;

export function getOrderSource() {
  sourceRequest ??= fetch(ordersEndpoint, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(8000) })
    .then((response) => {
      if (response.ok) return "shared" as const;
      if (response.status === 404) return "browser" as const;
      throw new Error("Couldn’t connect to the order store.");
    })
    .catch((error) => {
      sourceRequest = undefined;
      throw error;
    });
  return sourceRequest;
}

async function requestOrders<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("The order store couldn’t complete the request.");
  return response.json() as Promise<T>;
}

export async function getOrders(ticketId?: string) {
  const source = await getOrderSource();
  const url = ticketId ? `${ordersEndpoint}?ticket=${encodeURIComponent(ticketId)}` : ordersEndpoint;
  const tickets = source === "shared"
    ? await requestOrders<QueueTicket[]>(url)
    : readQueue().filter((ticket) => !ticketId || ticket.id === ticketId);
  return { source, tickets };
}

export async function createOrder(id: string, details: OrderDetails) {
  if (await getOrderSource() === "browser") return createBrowserOrder(id, details);

  return requestOrders<PickupOrder>(ordersEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...details }),
  });
}

export async function advanceOrder(id: string, status: TicketStatus) {
  if (await getOrderSource() === "browser") return updateTicketStatus(id, status);

  return requestOrders<boolean>(ordersEndpoint, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
}
