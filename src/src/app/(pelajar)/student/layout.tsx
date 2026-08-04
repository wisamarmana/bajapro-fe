import React from "react";
import StudentLayoutClient from "@/src/components/navigation/StudentLayoutClient";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutClient>{children}</StudentLayoutClient>;
}
