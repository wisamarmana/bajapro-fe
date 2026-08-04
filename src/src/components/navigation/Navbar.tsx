"use client";

import React from "react";
import {
  Layout,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Breadcrumb,
  GetProp,
  BreadcrumbProps,
} from "antd";
import type { MenuProps } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  DownOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { allMenuItems, MenuItem } from "./Sidebar";
import { useAuth } from "@/src/hooks/useAuth";

const { Header } = Layout;
const { Text } = Typography;

type BreadcrumbItem = GetProp<BreadcrumbProps, "items">[number];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { user } = useAuth();

  const role =
    user?.has_roles?.[0]?.name?.toLowerCase() ??
    user?.roles?.[0]?.toLowerCase() ??
    "";

  const userInfo = {
    name: user?.name || "User",
    role:
      role === "super"
        ? "ADMIN"
        : role === "teacher"
        ? "PENGAJAR"
        : "PELAJAR",
  };

  const generateAutoBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split("/").filter(Boolean);

    const breadcrumbData: {
      label: React.ReactNode;
      key: string;
    }[] = [];

    if (
      segments.length === 0 ||
      (segments.length === 1 && segments[0] === "dashboard")
    ) {
      return [
        {
          title: (
            <span
              style={{
                color: "#531DAB",
                fontWeight: 600,
              }}
            >
              Dashboard
            </span>
          ),
          key: "dashboard",
        },
      ];
    }

    const getMenuLabelByPath = (
      path: string,
      items: MenuItem[]
    ): { label: React.ReactNode; parent?: string } | null => {
      for (const item of items) {
        const itemHref = (item.label as any)?.props?.href;

        if (itemHref === "/" + path) {
          return {
            label: item.label,
          };
        }

        if (item.children) {
          const found = getMenuLabelByPath(path, item.children);

          if (found) {
            return {
              label: found.label,
              parent: item.label as string,
            };
          }
        }
      }

      return null;
    };

    segments.forEach((seg) => {
      if (seg === "dashboard") return;

      const menuInfo = getMenuLabelByPath(seg, allMenuItems);

      if (menuInfo) {
        if (menuInfo.parent) {
          breadcrumbData.push({
            label: menuInfo.parent,
            key: "p-" + seg,
          });
        }

        breadcrumbData.push({
          label: menuInfo.label,
          key: seg,
        });
      } else {
        let label = seg;

        if (seg === "add") label = "Tambah Baru";
        else if (seg === "edit") label = "Edit Data";
        else if (!isNaN(Number(seg)) || seg.length > 10)
          label = "Detail";

        breadcrumbData.push({
          label: (
            <span style={{ textTransform: "capitalize" }}>
              {label}
            </span>
          ),
          key: seg,
        });
      }
    });

    return breadcrumbData.map((item, index) => {
      const isLast = index === breadcrumbData.length - 1;

      let finalLabel = item.label;

      if (isLast && React.isValidElement(item.label)) {
        // @ts-ignore
        finalLabel = item.label.props.children || item.label;
      }

      return {
        key: item.key,
        title: (
          <span
            style={{
              color: isLast ? "#531DAB" : "#8c8c8c",
              fontWeight: isLast ? 600 : 400,
            }}
          >
            {finalLabel}
          </span>
        ),
      };
    });
  };

  const handleLogout = async () => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const userMenu: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profil Saya",
      onClick: () => router.push("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: (
        <LogoutOutlined
          style={{
            color: "#ff4d4f",
          }}
        />
      ),
      label: (
        <span
          style={{
            color: "#ff4d4f",
          }}
        >
          Keluar
        </span>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: "0 32px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
        height: "72px",
      }}
    >
      <Breadcrumb
        items={generateAutoBreadcrumbs()}
        separator={
          <span
            style={{
              color: "#bfbfbf",
            }}
          >
            /
          </span>
        }
        style={{
          fontSize: "15px",
        }}
      />

      <Dropdown
        menu={{
          items: userMenu,
        }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Space
          style={{
            cursor: "pointer",
            gap: "8px",
          }}
        >
          <Avatar
            style={{
              backgroundColor:
                role === "admin"
                  ? "#FAAD14"
                  : role === "teacher"
                  ? "#52C41A"
                  : "#531DAB",
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            {userInfo.name.charAt(0).toUpperCase()}
          </Avatar>

          <Text
            style={{
              color: "#531DAB",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            {userInfo.name}
          </Text>

          <DownOutlined
            style={{
              fontSize: "12px",
              color: "#531DAB",
              marginLeft: "4px",
            }}
          />
        </Space>
      </Dropdown>
    </Header>
  );
};

export default Navbar;