import { DEMO_QUEUE } from "./fixtures";
import { nextStatus, type QueueTicket, type TicketStatus } from "./model";

const STORAGE_KEY = "buzzer:demo-queue:v1";
const UPDATE_EVENT = "buzzer:queue-updated";

function isQueueTicket(value: unknown): value is QueueTicket {
  if (!value || typeof value !== "object") return false;

  const { id, number, status } = value as Partial<QueueTicket>;
  return (
    typeof id === "string" && id.length > 0 &&
    typeof number === "number" && Number.isSafeInteger(number) && number > 0 &&
    (status === "waiting" || status === "ready" || status === "collected")
  );
}

export function readQueue(): QueueTicket[] {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === null) return DEMO_QUEUE;

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

export function updateTicketStatus(id: string, status: TicketStatus) {
  return changeQueue(() => {
    const tickets = readQueue();
    const ticket = tickets.find((entry) => entry.id === id);
    if (!ticket || nextStatus(ticket.status) !== status) return false;

    saveQueue(tickets.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    return true;
  });
}
