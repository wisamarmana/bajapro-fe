"use client";

import { ApprovalTable } from "@/src/features/approval/components/ApprovalTable";

export default function ApprovalManager() {
  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <ApprovalTable />
    </div>
  );
}
