"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname().replace(/\/$/, "");
  const isStaffPage = pathname === "/staff";

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg font-[760] tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground sm:size-8">
            <BellRing size={17} aria-hidden="true" />
          </span>
          <span className="text-xl">Buzzer</span>
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
