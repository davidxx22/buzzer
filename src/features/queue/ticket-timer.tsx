import type { QueueTicket } from "./model";

export function TicketTimer({ ticket, now }: { ticket: QueueTicket; now: number | null }) {
  if (ticket.status === "collected" || ticket.statusStartedAt === undefined || now === null) return null;

  const elapsedSeconds = Math.max(0, Math.floor((now - ticket.statusStartedAt) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const waiting = ticket.status === "waiting";

  return (
    <div role="timer" className="self-center text-right md:w-20">
      <span className="sr-only">
        {waiting ? `${minutes} min waiting` : `${minutes} min ${seconds} sec since ready`}
      </span>
      <div aria-hidden="true">
        <span className="block font-display text-[1.75rem] leading-none font-semibold tabular-nums md:text-[2rem]">
          {waiting ? minutes : `${minutes}:${String(seconds).padStart(2, "0")}`}
        </span>
        <span className="mt-0.5 block text-xs whitespace-nowrap text-muted-foreground">
          {waiting ? "min waiting" : "since ready"}
        </span>
      </div>
    </div>
  );
}
