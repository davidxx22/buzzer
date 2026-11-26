"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname().replace(/\/$/, "");
  const isStaffPage = pathname === "/staff";

  return (
    <header className="h-16 border-b border-border bg-card">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-4 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <BellRing size={16} strokeWidth={1.5} aria-hidden="true" />
          </span>
          <span>Buzzer</span>
        </Link>
        {pathname !== "/ticket" && <nav aria-label="Main navigation">
          <Link
            href="/staff"
            aria-current={isStaffPage ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition-colors duration-150 ease-control",
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
