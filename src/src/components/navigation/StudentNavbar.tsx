"use client";

import React from "react";
import { Layout, Avatar, Dropdown, Space, Typography, MenuProps, Button } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { DownOutlined, LogoutOutlined, UserOutlined, MenuOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/src/hooks/useAuth";
const { Header } = Layout;
const { Text } = Typography;

interface StudentNavbarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
  setMobileOpen?: (open: boolean) => void;
}

const StudentNavbar: React.FC<StudentNavbarProps> = ({ setMobileOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const userInfo = {
    name: user?.name || "Pelajar",
    role: user?.has_roles?.[0]?.name || "Pelajar",
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil Saya",
      onClick: () => router.push("/student/profile"),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Keluar</span>,
      onClick: async () => {
        const handleLogout = async () => {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
              method: "POST",
              credentials: "include",
            });

            if (!res.ok) {
              throw new Error("Logout gagal");
            }

            router.replace("/login");
            router.refresh();
          } catch (err) {
            console.error(err);
          }
        };
        await handleLogout();
      },
    },
  ];

  const isMaterialPage = pathname.includes("/student/material") || pathname.includes("/student/test");

  let pageTitle = "Dashboard";
  if (pathname.includes("/student/course")) pageTitle = "Course";
  else if (pathname.includes("/student/level")) pageTitle = "Level";
  else if (pathname.includes("/student/leaderboard")) pageTitle = "Leaderboard";
  else if (pathname.includes("/student/report")) pageTitle = "Report";
  else if (pathname.includes("/student/profile")) pageTitle = "Profile";

  const navLinks = [
    { name: "Home", path: "/student/dashboard" },
    { name: "Course", path: "/student/course" },
    { name: "Leaderboard", path: "/student/leaderboard" },
  ];

  const initials = (() => {
    const parts = userInfo.name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  })();

  return (
    <Header
      style={{
        padding: "0 16px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #E5E7EB",
        height: "72px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      {/* Left Area */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Hamburger — only on mobile (md:hidden via inline media) */}
        {!isMaterialPage && setMobileOpen && (
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileOpen(true)}
            className="md:hidden"
            style={{ fontSize: "20px", color: "#5B21B6" }}
          />
        )}

        {isMaterialPage && (
          <div
            style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={() => router.push("/student/dashboard")}
          >
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
      </div>

      {/* Middle Area */}
      <div style={{ display: "flex", justifyContent: "center", flex: 1 }}>
        {isMaterialPage ? (
          <div style={{ display: "flex", gap: "32px" }}>
            {navLinks.map((link) => {
              const isActive =
                pathname.startsWith(link.path) ||
                (link.name === "Home" && pathname === "/student/dashboard");
              return (
                <Link key={link.name} href={link.path}>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "#5B21B6" : "#9CA3AF",
                      cursor: "pointer",
                      transition: "all 0.3s",
                    }}
                  >
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <Text style={{ fontSize: "18px", fontWeight: 600, color: "#1F2937" }}>
            {pageTitle}
          </Text>
        )}
      </div>

      {/* Right Area */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={["click"]}>
          <Space style={{ cursor: "pointer", gap: "10px" }}>
            <Avatar style={{ backgroundColor: "#F59E0B", color: "#fff", fontWeight: "bold" }}>
              {initials}
            </Avatar>
            {/* Hide name on small screens */}
            <Text className="hidden sm:inline" style={{ color: "#5B21B6", fontWeight: 600, fontSize: "14px" }}>
              {userInfo.name}
            </Text>
            <DownOutlined style={{ fontSize: "12px", color: "#5B21B6" }} />
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
};

export default StudentNavbar;
