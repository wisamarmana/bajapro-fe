"use client";

import { ApprovalTable } from "@/src/components/features/approval/ApprovalTable";

export default function ApprovalManager() {
  return (
    <div style={{ padding: "24px", backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <ApprovalTable />
    </div>
  );
}
