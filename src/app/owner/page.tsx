import type { Metadata } from "next";
import { OwnerDashboard } from "@/features/owner/owner-dashboard";

export const metadata: Metadata = { title: "Owner dashboard" };

export default function OwnerPage() {
  return <OwnerDashboard />;
}
