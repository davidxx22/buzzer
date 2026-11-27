"use client";

import { BellRing, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function SiteHeader() {
  const pathname = usePathname().replace(/\/$/, "");
  const isStaffPage = pathname === "/staff";
  const businessMenu = useRef<HTMLDetailsElement>(null);
  const businessMenuTrigger = useRef<HTMLElement>(null);

  const closeBusinessMenu = useCallback((restoreFocus = false) => {
    const menu = businessMenu.current;
    if (!menu?.open) return;

    menu.open = false;
    if (restoreFocus) businessMenuTrigger.current?.focus();
  }, []);

  useEffect(() => {
    function closeOnOutsidePress(event: PointerEvent) {
      if (event.target instanceof Node && !businessMenu.current?.contains(event.target)) closeBusinessMenu();
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [closeBusinessMenu]);

  return (
    <header className="staff-theme relative bg-card text-foreground shadow-[0_2px_8px_-2px_rgb(0_0_0/0.14)]">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-lg">
          <BellRing size={19} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
          <span className="font-display text-2xl leading-none font-semibold">Buzzer</span>
        </Link>
        {pathname !== "/ticket" && (
          <nav aria-label="Main navigation">
            <details
              ref={businessMenu}
              className="group relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) closeBusinessMenu();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape" && event.currentTarget.open) {
                  event.preventDefault();
                  closeBusinessMenu(true);
                }
              }}
            >
              <summary
                ref={businessMenuTrigger}
                aria-label="Business menu"
                className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-2 hover:bg-muted [&::-webkit-details-marker]:hidden"
              >
                <Image src="/business-logo.png" alt="" width={32} height={32} unoptimized className="size-8 rounded-full object-cover" />
                <ChevronDown size={16} strokeWidth={1.5} className="text-muted-foreground group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="absolute top-full right-0 z-20 mt-2 min-w-40 rounded-xl border border-border bg-card p-1 shadow-lg shadow-black/10">
                <Link
                  href="/staff"
                  aria-current={isStaffPage ? "page" : undefined}
                  className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold whitespace-nowrap hover:bg-muted"
                  onClick={() => closeBusinessMenu(true)}
                >
                  Staff queue
                </Link>
              </div>
            </details>
          </nav>
        )}
      </div>
    </header>
  );
}
