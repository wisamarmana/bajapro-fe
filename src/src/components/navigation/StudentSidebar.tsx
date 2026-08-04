"use client";

import React from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  BookOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const { Sider } = Layout;

interface StudentSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  let activeKey = "dashboard";
  if (
    pathname.includes("/student/course") ||
    pathname.includes("/student/level") ||
    pathname.includes("/student/report")
  ) {
    activeKey = "course";
  } else if (pathname.includes("/student/leaderboard")) {
    activeKey = "leaderboard";
  }

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined style={{ fontSize: "18px" }} />,
      label: (
        <Link
          href="/student/dashboard"
          style={{ fontSize: "14px", fontWeight: activeKey === "dashboard" ? 600 : 500 }}
        >
          Dashboard
        </Link>
      ),
    },
    {
      key: "course",
      icon: <BookOutlined style={{ fontSize: "18px" }} />,
      label: (
        <Link
          href="/student/course"
          style={{ fontSize: "14px", fontWeight: activeKey === "course" ? 600 : 500 }}
        >
          Course
        </Link>
      ),
    },
    {
      key: "leaderboard",
      icon: <BarChartOutlined style={{ fontSize: "18px" }} />,
      label: (
        <Link
          href="/student/leaderboard"
          style={{ fontSize: "14px", fontWeight: activeKey === "leaderboard" ? 600 : 500 }}
        >
          Leaderboard
        </Link>
      ),
    },
  ];

  const sidebarContent = (inDrawer = false) => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header: Logo & Toggle */}
      <div
        style={{
          padding: "16px 20px",
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !inDrawer ? "center" : "space-between",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        {(!collapsed || inDrawer) && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Image
              src="/assets/logo/logo-completed.png"
              alt="Logo BAJAPRO"
              width={120}
              height={40}
              style={{ width: "auto", height: "20px", objectFit: "contain" }}
              priority
            />
          </div>
        )}
        {!inDrawer && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", color: "#5B21B6" }}
          />
        )}
      </div>

      {/* Menu list */}
      <div style={{ flex: 1, paddingTop: "24px" }}>
        <style>{`
          .student-sidebar-menu.ant-menu-light .ant-menu-item-selected {
            background-color: #EDE9FE !important;
            color: #5B21B6 !important;
          }
          .student-sidebar-menu.ant-menu-light .ant-menu-item-selected a {
            color: #5B21B6 !important;
          }
          .student-sidebar-menu.ant-menu-light .ant-menu-item:hover {
            background-color: #EDE9FE40 !important;
            color: #5B21B6 !important;
          }
          .student-sidebar-menu.ant-menu-light .ant-menu-item:hover a {
            color: #5B21B6 !important;
          }
        `}</style>
        <Menu
          className="student-sidebar-menu"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          style={{ border: "none" }}
          inlineCollapsed={!inDrawer && collapsed}
          onClick={() => inDrawer && setMobileOpen(false)}
        />
      </div>

      {/* Footer: Logout */}
      <div style={{ padding: "16px", borderTop: "1px solid #F3F4F6" }}>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          danger
          block
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed && !inDrawer ? "center" : "flex-start",
            gap: collapsed && !inDrawer ? "0" : "12px",
            height: "40px",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          {(!collapsed || inDrawer) && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile (< md) */}
      <div className="hidden md:block">
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          theme="light"
          width={240}
          collapsedWidth={80}
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
            left: 0,
            borderRight: "1px solid #E5E7EB",
            zIndex: 1001,
            backgroundColor: "#FFFFFF",
          }}
        >
          {sidebarContent(false)}
        </Sider>
      </div>

      {/* Mobile Drawer — only on mobile (< md) */}
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        size="default"
        closable={false}
        styles={{ body: { padding: 0 }, header: { display: "none" } }}
        className="md:hidden"
      >
        {sidebarContent(true)}
      </Drawer>
    </>
  );
};

export default StudentSidebar;
