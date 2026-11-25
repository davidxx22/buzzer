"use client";

import { BellRing } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const views = [
  { href: "/queue", label: "Customer" },
  { href: "/staff", label: "Staff" },
  { href: "/owner", label: "Owner" },
];

export function SiteHeader() {
  const pathname = usePathname().replace(/\/$/, "") || "/";

  return (
    <header className="border-b border-border bg-card print:hidden">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-8">
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-lg font-[760] tracking-tight">
          <span className="grid size-7 place-items-center rounded-lg bg-primary text-primary-foreground sm:size-8">
            <BellRing size={17} aria-hidden="true" />
          </span>
          <span className="text-xl">Buzzer</span>
        </Link>
        <nav aria-label="Demo views" className="flex items-center gap-0.5 sm:gap-1">
          {views.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold transition-colors sm:px-4",
                pathname === href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
