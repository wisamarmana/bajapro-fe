import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BlockOutlined,
  UserOutlined,
  BarChartOutlined,
  BookOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
  SettingOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
  SafetyCertificateOutlined,
  DeploymentUnitOutlined,
  BankOutlined
} from "@ant-design/icons";
import { Layout, Menu, ConfigProvider, Button, Badge } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

const { Sider } = Layout;

// ==========================================
// 1. AREA DATA & FUNGSI (DI LUAR KOMPONEN)
// ==========================================

export interface MenuItem {
  key: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  roles?: string[];
  permission?: string; // Tambahkan field permission
  children?: MenuItem[];
}

export const allMenuItems: MenuItem[] = [
  {
    key: "dashboard",
    icon: <DashboardOutlined />,
    label: <Link href="/dashboard">Dashboard</Link>,
    roles: ["ADMIN", "PENGAJAR"],
  },
  {
    key: "g-materi",
    icon: <BookOutlined />,
    label: "Kelola Materi",
    children: [
      {
        key: "level",
        label: <Link href="/level">Level</Link>,
        icon: <DeploymentUnitOutlined />,
        roles: ["ADMIN"],
        permission: "m_levels.view",
      },
      {
        key: "course",
        label: <Link href="/course">Course</Link>,
        icon: <BlockOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
        permission: "m_courses.view",
      },
      {
        key: "question",
        label: <Link href="/code_question">Question</Link>,
        icon: <QuestionCircleOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
        // TODO: Jika question punya permission sendiri (misal question.read), bisa diubah di sini
        // Karena question tidak ada di list permission, kita fallback ke roles atau biarkan
      },
    ],
  },
  {
    key: "g-pengguna",
    icon: <UserOutlined />,
    label: "Kelola Pengguna",
    children: [
      {
        key: "roles",
        label: <Link href="/roles">Roles</Link>,
        icon: <SafetyCertificateOutlined />,
        roles: ["ADMIN"],
      },
      {
        key: "kelas",
        label: <Link href="/kelas">Kelas</Link>,
        icon: <BankOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
        permission: "classes.view",
      },
      {
        key: "users",
        label: <Link href="/users">Users</Link>,
        icon: <TeamOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
        permission: "users.view",
      },
      {
        key: "approval",
        label: (
          <Link href="/approval" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Approval
          </Link>
        ),
        icon: <AppstoreAddOutlined />,
        roles: ["ADMIN"],
      },
      {
        key: "permission",
        label: <Link href="/permission">Permission</Link>,
        icon: <SettingOutlined />,
        roles: ["ADMIN"],
        permission: "permissions.view",
      },
    ],
  },
  {
    key: "g-report",
    icon: <BarChartOutlined />,
    label: "Report",
    children: [
      {
        key: "hasil-belajar",
        label: <Link href="/report">Hasil Belajar</Link>,
        icon: <BarChartOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
      {
        key: "leaderboard",
        label: <Link href="/leaderboard">Leaderboard</Link>,
        icon: <TrophyOutlined />,
        roles: ["ADMIN", "PENGAJAR"],
      },
    ],
  },
  {
    key: "g-gamifikasi",
    icon: <TrophyOutlined />,
    label: "Gamifikasi",
    roles: ["ADMIN"],
    children: [
      {
        key: "badge",
        label: <Link href="/badge">Badge Settings</Link>,
        icon: <SettingOutlined />,
      },
    ],
  },
];

import { useAuth } from "@/src/hooks/useAuth";

const getFilteredMenu = (
  menuData: MenuItem[],
  userRole: string,
  can: (permissionName: string) => boolean
): MenuItem[] => {
  return menuData
    .filter((item) => {
      // 1. Jika item butuh permission, cek apakah punya izin
      if (item.permission && !can(item.permission)) {
        return false;
      }
      // 2. Fallback ke role (misal dashboard tidak punya permission spesifik)
      if (item.roles && !item.roles.includes(userRole)) {
        return false;
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = getFilteredMenu(item.children, userRole, can);
        // Jika parent, dan semua childrennya hilang karena filter, sembunyikan parent
        if (filteredChildren.length === 0) return null;
        return {
          ...item,
          children: filteredChildren,
        };
      }
      return item;
    })
    .filter(Boolean) as MenuItem[]; // hapus item yang null
};

// ==========================================
// 2. AREA KOMPONEN UTAMA
// ==========================================

interface SidebarProps {
  role?: "ADMIN" | "PENGAJAR";
}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { can, user } = useAuth();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);

  const userRole = user?.has_roles?.some(
    (r: any) =>
      r.id === 1 ||
      String(r.name).toLowerCase() === "super" ||
      String(r.name).toLowerCase() === "admin"
  )
    ? "ADMIN"
    : "PENGAJAR";

  // Fetch pending approval count
  useEffect(() => {
    if (userRole === "ADMIN") {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/users?role_id=2`, { cache: 'no-store', credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const pending = data.filter((item: any) => item.approval === 0);
            setPendingApprovalCount(pending.length);
          }
        })
        .catch(() => { /* ignore */ });
    }
  }, [userRole]);

  // Filter dengan fungsi `can`
  const rawFilteredItems = getFilteredMenu(allMenuItems, userRole, can);
  
  // Inject approval badge count into the filtered menu items
  const filteredItems = rawFilteredItems.map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => {
          if (child.key === "approval" && pendingApprovalCount > 0) {
            return {
              ...child,
              label: (
                <Link href="/approval" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>Approval</span>
                  <Badge count={pendingApprovalCount} size="small" style={{ backgroundColor: '#ff4d4f' }} />
                </Link>
              ),
            };
          }
          return child;
        }),
      };
    }
    return item;
  });

  // --- FUNGSI OTOMATIS: Mencari Key & Parent yang Aktif ---
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  // 1. Mencari menu mana yang paling cocok dengan URL saat ini (Berdasarkan Link)
  const getActiveState = () => {
    let activeKey = "dashboard";
    let parentKey = "";

    const findActive = (items: MenuItem[], parent?: string) => {
      for (const item of items) {
        // Cek apakah item ini punya Link yang cocok dengan awal pathname
        // Misal: pathname /code_question/add cocok dengan Link /code_question
        const itemHref = (item.label as any)?.props?.href;
        
        if (itemHref && pathname.startsWith(itemHref)) {
          activeKey = item.key;
          if (parent) parentKey = parent;
        }

        if (item.children) {
          findActive(item.children, item.key);
        }
      }
    };

    findActive(allMenuItems);
    
    // Kasus khusus dashboard
    if (pathname === "/dashboard") activeKey = "dashboard";
    
    return { activeKey, parentKey };
  };

  const { activeKey, parentKey } = getActiveState();

  // 2. Efek untuk sinkronisasi folder (Accordion)
  React.useEffect(() => {
    if (parentKey && !collapsed) {
      setOpenKeys([parentKey]); // Hanya buka satu parent (Accordion)
    }
  }, [parentKey, collapsed]);

  const handleOpenChange = (keys: string[]) => {
    // Logika Accordion: Ambil key terakhir yang diklik
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    if (latestOpenKey) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys([]);
    }
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: "#595959",
            itemSelectedColor: "#531DAB",
            itemHoverColor: "#531DAB",
            groupTitleColor: "#8C8C8C",
            itemHoverBg: "#EEE8F7",
            itemSelectedBg: "#EEE8F7",
            subMenuItemBg: "transparent",
            fontSize: 14,
          },
        },
        token: {
          colorPrimary: "#531DAB",
        },
      }}
    >
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="light"
        width={250}
        style={{
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Wrapper Utama agar Flexbox jalan di dalam Sider */}
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* 1. AREA LOGO (Header Sidebar) */}
          <div
            style={{
              padding: "16px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "space-between",
              flexShrink: 0, // Biar gak gepeng
            }}
          >
            {!collapsed && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
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
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "16px", color: "#531DAB" }}
            />
          </div>

          {/* 2. AREA MENU (YANG BISA DI-SCROLL) */}
          <div
            style={{
              flex: 1, 
              overflowY: "auto",
              overflowX: "hidden",
              paddingBottom: "100px"
            }}
            className="custom-scrollbar"
          >
            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              openKeys={openKeys}
              onOpenChange={handleOpenChange}
              items={filteredItems as MenuProps["items"]}
            />
          </div>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default Sidebar;
