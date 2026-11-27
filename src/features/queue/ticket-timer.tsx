import type { QueueTicket } from "./model";

export function TicketTimer({ ticket, now }: { ticket: QueueTicket; now: number | null }) {
  if (ticket.status === "collected" || ticket.statusStartedAt === undefined || now === null) return null;

  const elapsedSeconds = Math.max(0, Math.floor((now - ticket.statusStartedAt) / 1000));
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const label = ticket.status === "waiting" ? "waiting" : "since ready";

  return (
    <div role="timer" className="self-center text-right md:w-20">
      <span className="sr-only">
        {`${minutes} min ${seconds} sec ${label}`}
      </span>
      <div aria-hidden="true">
        <span className="block font-display text-[1.75rem] leading-none font-semibold tabular-nums md:text-[2rem]">
          {`${minutes}:${String(seconds).padStart(2, "0")}`}
        </span>
        <span className="mt-0.5 block text-xs whitespace-nowrap text-muted-foreground">
          {label}
        </span>
      </div>
    </div>
  );
}
