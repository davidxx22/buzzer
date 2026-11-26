"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname().replace(/\/$/, "");
  const isStaffPage = pathname === "/staff";

  return (
    <header className={cn("border-b border-border bg-card text-foreground", isStaffPage && "staff-theme")}>
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 rounded-lg">
          <BellRing size={19} strokeWidth={1.75} className="text-primary" aria-hidden="true" />
          <span className="font-display text-2xl leading-none font-semibold">Buzzer</span>
        </Link>
        {pathname !== "/ticket" && <nav aria-label="Main navigation">
          <Link
            href="/staff"
            aria-current={isStaffPage ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold transition-colors sm:px-4",
              isStaffPage ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Staff
          </Link>
        </nav>}
      </div>
    </header>
  );
}
