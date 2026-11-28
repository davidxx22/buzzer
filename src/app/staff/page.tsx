import type { Metadata } from "next";
import { CoffeeShopLogo } from "@/components/brand-marks";
import { StaffQueue } from "@/features/queue/staff-queue";

export const metadata: Metadata = { title: "Staff queue" };

export default function StaffPage() {
  return (
    <div className="staff-theme px-4 pt-2.5 pb-8 text-foreground sm:px-8 sm:pb-12">
      <CoffeeShopLogo />
      <StaffQueue />
    </div>
  );
}
