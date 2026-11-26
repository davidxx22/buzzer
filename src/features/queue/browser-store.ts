import { isPickupOrder, isQueueTicket, newPickupOrder, nextStatus, type OrderDetails, type QueueTicket, type TicketStatus } from "./model";

const STORAGE_KEY = "buzzer:demo-queue:v1";
const UPDATE_EVENT = "buzzer:queue-updated";

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

async function changeQueue<T>(change: () => T): Promise<T> {
  return navigator.locks ? navigator.locks.request(STORAGE_KEY, change) : change();
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

export function updateTicketStatus(id: string, status: TicketStatus) {
  return changeQueue(() => {
    const tickets = readQueue();
    const ticket = tickets.find((entry) => entry.id === id);
    if (!ticket || nextStatus(ticket.status) !== status) return false;

    saveQueue(tickets.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    return true;
  });
}
