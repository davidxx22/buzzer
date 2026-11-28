import type { Metadata } from "next";
import { CoffeeShopLogo } from "@/components/brand-marks";
import { StaffQueue } from "@/features/queue/staff-queue";

export const metadata: Metadata = { title: "Staff queue" };

export default function StaffPage() {
  return (
    <div className="staff-theme mx-auto w-[calc(100%-2rem)] max-w-[65rem] pt-2.5 pb-8 text-foreground sm:w-[calc(100%-4rem)] sm:pb-12">
      <CoffeeShopLogo />
      <StaffQueue />
    </div>
  );
}
