import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerQueue, CustomerQueueLoading } from "@/features/queue/customer-queue";

export const metadata: Metadata = { title: "Customer queue" };

export default function QueuePage() {
  return (
    <Suspense fallback={<CustomerQueueLoading />}>
      <CustomerQueue />
    </Suspense>
  );
}
