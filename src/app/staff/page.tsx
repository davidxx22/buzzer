import type { Metadata } from "next";
import { StaffQueue } from "@/features/queue/staff-queue";

export const metadata: Metadata = { title: "Staff queue" };

export default function StaffPage() {
  return (
    <div className="staff-theme flow-root bg-background text-foreground">
      <StaffQueue />
    </div>
  );
}
