"use client";

import React, { useState } from "react";
import { Layout } from "antd";
import { usePathname } from "next/navigation";
import StudentNavbar from "@/src/components/navigation/StudentNavbar";
import StudentSidebar from "@/src/components/navigation/StudentSidebar";
import StudentFooter from "@/src/components/navigation/StudentFooter";

const { Content } = Layout;

export default function StudentLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isMaterialPage =
    pathname.includes("/student/material") || pathname.includes("/student/test");

  // Determine the premium gradient background based on the page type
  let bgGradient = "linear-gradient(135deg, #F4F0FF 0%, #E8F9FF 100%)";
  if (pathname.includes("/student/leaderboard")) {
    bgGradient = "linear-gradient(135deg, #FFFFFF 0%, #FFFDF0 50%, #F4FBF7 100%)";
  }

  if (isMaterialPage) {
    // Material page layout: full-width, no sidebar, centered topbar nav
    return (
      <Layout style={{ minHeight: "100vh", background: "#F3F4F6" }}>
        <StudentNavbar />
        <Content
          style={{
            width: "100%",
            margin: "0 auto",
            padding: "72px 0 0 0",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {children}
          </div>
          <StudentFooter />
        </Content>
      </Layout>
    );
  }

  // Dashboard & other pages layout: Sidebar + Topbar + Content
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <StudentSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <Layout style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <StudentNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
        <Content
          style={{
            flex: 1,
            padding: "72px 0 0 0",
            display: "flex",
            flexDirection: "column",
            background: bgGradient,
            minHeight: "calc(100vh - 72px)",
          }}
        >
          {/* Responsive content padding: compact on mobile, spacious on desktop */}
          <div className="p-4 sm:p-6 md:p-8 lg:p-10" style={{ flex: 1 }}>
            {children}
          </div>
          <StudentFooter />
        </Content>
      </Layout>
    </Layout>
  );
}
