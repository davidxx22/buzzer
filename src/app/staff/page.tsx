import type { Metadata } from "next";
import { StaffQueue } from "@/features/queue/staff-queue";

export const metadata: Metadata = { title: "Staff queue" };

export default function StaffPage() {
  return (
    <div className="staff-theme flow-root min-h-[calc(100dvh-4rem-1px)] bg-background text-foreground">
      <StaffQueue />
    </div>
  );
}
