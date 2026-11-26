import type { Metadata } from "next";
import { Suspense } from "react";
import { PickupTicket, TicketLoading } from "@/features/queue/pickup-ticket";

export const metadata: Metadata = { title: "Pickup ticket", robots: { index: false, follow: false } };

export default function TicketPage() {
  return <Suspense fallback={<TicketLoading />}><PickupTicket /></Suspense>;
}
