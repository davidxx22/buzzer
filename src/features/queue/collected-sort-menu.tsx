import { ArrowDownWideNarrow, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

const sortLabels = {
  latest: "Latest collected",
  number: "Ticket number",
};

export type CollectedSort = keyof typeof sortLabels;

export function CollectedSortMenu({ value, onChange }: {
  value: CollectedSort;
  onChange: (value: CollectedSort) => void;
}) {
  const menu = useRef<HTMLDetailsElement>(null);
  const trigger = useRef<HTMLElement>(null);

  function close(restoreFocus = false) {
    if (!menu.current?.open) return;
    menu.current.open = false;
    if (restoreFocus) trigger.current?.focus();
  }

  useEffect(() => {
    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) close();
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, []);

  return (
    <div className="ms-auto inline-flex shrink-0 items-center gap-2 text-sm">
      <span aria-hidden="true" className="text-muted-foreground portrait:max-md:hidden">Sort by:</span>
      <details
        ref={menu}
        className="relative"
        onBlur={(event) => {
          if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && event.currentTarget.open) {
            event.preventDefault();
            close(true);
          }
        }}
      >
        <summary
          ref={trigger}
          aria-label={`Sort by: ${sortLabels[value]}`}
          title="Sort collected orders"
          className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg px-3 font-medium text-foreground focus:outline-none portrait:max-md:w-11 portrait:max-md:px-0 [&::-webkit-details-marker]:hidden"
        >
          <ArrowDownWideNarrow size={20} strokeWidth={1.75} className="hidden portrait:max-md:block" aria-hidden="true" />
          <span className="portrait:max-md:hidden">{sortLabels[value]}</span>
          <ChevronDown size={16} strokeWidth={1.5} className="text-muted-foreground portrait:max-md:hidden" aria-hidden="true" />
        </summary>
        <div role="group" aria-label="Sort choices" className="absolute end-0 top-full z-20 mt-1 grid w-max min-w-full gap-0.5 rounded-lg border border-border bg-card p-1 shadow-md shadow-black/10">
          {(["latest", "number"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              className="flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 text-start font-medium text-foreground hover:bg-muted aria-pressed:bg-muted"
              onClick={() => {
                onChange(option);
                close(true);
              }}
            >
              {sortLabels[option]}
              <Check size={14} strokeWidth={2} className={value === option ? "shrink-0 text-primary" : "invisible shrink-0"} aria-hidden="true" />
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
