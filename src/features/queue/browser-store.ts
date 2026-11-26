import { isPickupOrder, isQueueTicket, newPickupOrder, nextStatus, type OrderDetails, type QueueTicket, type TicketStatus } from "./model";
import { publishTicketStatus } from "./ticket-status";

const STORAGE_KEY = "buzzer:demo-queue:v1";
const UPDATE_EVENT = "buzzer:queue-updated";
const sharingKey = (id: string) => `buzzer:ticket-sharing:${id}`;

export function readQueue(): QueueTicket[] {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === null) return [];

  const data: unknown = JSON.parse(saved);
  if (!Array.isArray(data) || !data.every(isQueueTicket)) {
    throw new Error("Invalid saved demo queue.");
  }

  return data;
}

export function subscribeToQueue(onChange: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) onChange();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(UPDATE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(UPDATE_EVENT, onChange);
  };
}

function saveQueue(tickets: QueueTicket[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

async function changeQueue<T>(change: () => T): Promise<Awaited<T>> {
  return await (navigator.locks ? navigator.locks.request(STORAGE_KEY, change) : change());
}

export function createBrowserOrder(id: string, details: OrderDetails) {
  return changeQueue(() => {
    const tickets = readQueue();
    const existing = tickets.find((ticket) => ticket.id === id);
    if (existing && isPickupOrder(existing)) return existing;

    const order = newPickupOrder(tickets, id, details);
    saveQueue([...tickets, order]);
    return order;
  });
}

export function shareBrowserOrder(id: string) {
  return changeQueue(async () => {
    const order = readQueue().find((ticket) => ticket.id === id);
    if (!order || !isPickupOrder(order)) throw new Error("The order is no longer in this queue.");

    const savedSecret = localStorage.getItem(sharingKey(id));
    const secret = savedSecret ?? Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const liveId = await publishTicketStatus(id, secret, order.status, !savedSecret);
    if (liveId && !savedSecret) localStorage.setItem(sharingKey(id), secret);
    return { order, liveId };
  });
}

export function updateTicketStatus(id: string, status: TicketStatus) {
  return changeQueue(async () => {
    const tickets = readQueue();
    const ticket = tickets.find((entry) => entry.id === id);
    if (!ticket || nextStatus(ticket.status) !== status) return false;

    const secret = localStorage.getItem(sharingKey(id));
    if (secret) await publishTicketStatus(id, secret, status);
    saveQueue(tickets.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    return true;
  });
}
