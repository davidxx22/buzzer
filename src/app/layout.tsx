import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Buzzer", template: "%s | Buzzer" },
  description: "Join the queue, follow your ticket, and collect your order when it’s ready.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="print:bg-white">
        <a
          href="#main-content"
          className="sr-only z-10 rounded-lg bg-card p-3 text-primary focus:not-sr-only focus:absolute focus:top-2 focus:left-2 print:hidden"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1}>{children}</main>
      </body>
    </html>
  );
}
