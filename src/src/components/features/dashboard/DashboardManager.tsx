"use client";

import React from "react";
import { Typography, Row, Col } from "antd";
import { useDashboard } from "@/src/hooks/dashboard/useDashboard";
import { StatCards } from "@/src/components/features/dashboard/StatCards";
import { ActivityChart } from "@/src/components/features/dashboard/ActivityChart";
import { ApprovalList } from "@/src/components/features/dashboard/ApprovalList";
import { ActiveClassesTable } from "@/src/components/features/dashboard/ActiveClassesTable";

const { Title } = Typography;

export default function DashboardManager() {
  const {
    loading,
    stats,
    activityData,
    pendingApprovals,
    activeClasses,
    currentUserRole,
    activityClassId, setActivityClassId,
    activityCourseId, setActivityCourseId,
    activityStartDate, setActivityStartDate,
    activityEndDate, setActivityEndDate,
    availableClasses, availableCourses
  } = useDashboard();

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        {/* The top bar (Navbar) in your design shows "Dashboard" and User profile.
            Assuming the top bar is handled in layout.tsx, we can hide the title here if it's redundant.
            But we'll keep it just in case. */}
        <Title level={2} style={{ margin: 0, fontWeight: "bold", display: "none" }}>Dashboard</Title>
      </div>

      <StatCards stats={stats} role={currentUserRole || "Pengajar"} loading={loading} />

      <Row gutter={[24, 24]} style={{ display: "flex" }}>
        <Col xs={24} lg={16} style={{ display: "flex", flexDirection: "column" }}>
          <ActivityChart 
            data={activityData} 
            role={currentUserRole || "Pengajar"} 
            activityClassId={activityClassId}
            setActivityClassId={setActivityClassId}
            activityCourseId={activityCourseId}
            setActivityCourseId={setActivityCourseId}
            activityStartDate={activityStartDate}
            setActivityStartDate={setActivityStartDate}
            activityEndDate={activityEndDate}
            setActivityEndDate={setActivityEndDate}
            availableClasses={availableClasses}
            availableCourses={availableCourses}
          />
        </Col>
        <Col xs={24} lg={8} style={{ display: "flex", flexDirection: "column" }}>
          <ApprovalList data={pendingApprovals} role={currentUserRole || "Pengajar"} />
        </Col>
      </Row>

      <ActiveClassesTable data={activeClasses} loading={loading} />
    </div>
  );
}

