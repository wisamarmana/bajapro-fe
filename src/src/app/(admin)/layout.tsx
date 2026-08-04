import React from "react";
import DashboardLayoutClient from "@/src/components/navigation/DashboardLayoutClient";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}