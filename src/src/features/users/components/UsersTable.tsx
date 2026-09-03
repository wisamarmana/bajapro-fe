import React from "react";

import { Table, Space, Button, Tag, Popconfirm } from "antd"; 
import type { TableProps } from "antd"; // 👈 Tambahkan ini biar ESLint aman
import { EyeFilled, EditFilled, DeleteFilled, TeamOutlined } from "@ant-design/icons"; 
import { useRouter } from "next/navigation";
import { UserData } from "@/src/types/users";
import { useAuth } from "@/src/hooks/useAuth";

interface UserTableProps {
  data: UserData[];
  loading: boolean;
  currentUserRole: string;
  onAction: (action: "view" | "edit", record: UserData) => void;
  onDelete: (id: string | number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({ 
  data, 
  loading, 
  currentUserRole, 
  onAction, 
  onDelete 
}) => {
  const router = useRouter();
  const { can } = useAuth();

  const columns: TableProps<UserData>['columns'] = [
    { 
      title: "No", 
      key: "no", 
      render: (_: unknown, __: unknown, index: number) => index + 1, 
      width: 60 
    },
    { 
      title: "Nama", 
      dataIndex: "name", 
      key: "name", 
      width: "25%", 
      sorter: (a: UserData, b: UserData) => a.name.localeCompare(b.name), 
    },
    { 
      title: "Role", 
      dataIndex: "role", 
      key: "role", 
      sorter: (a: UserData, b: UserData) => a.role.localeCompare(b.role), 
    },
    { 
      title: "Email", 
      dataIndex: "email", 
      key: "email", 
      sorter: (a: UserData, b: UserData) => a.email.localeCompare(b.email),
    },
    
    // 👇 KONDISI 1: JIKA ADMIN, TAMPILKAN KOLOM INSTANSI
    ...(currentUserRole == "Admin" ? [
      {
        title: "Instansi",
        dataIndex: "instansi_sekolah",
        key: "instansi_sekolah",
        sorter: (a: UserData, b: UserData) => (a.instansi_sekolah || "").localeCompare(b.instansi_sekolah || ""),
     
       
      }
    ] : []),

    // 👇 TAMPILKAN KOLOM KELAS UNTUK ADMIN DAN PENGAJAR
    {
      title: "Kelas",
      dataIndex: "class_name", 
      key: "class_name",
      sorter: (a: UserData, b: UserData) => (a.class_name || "").localeCompare(b.class_name || "")
    },

    {
      title: "Action", 
      key: "action",
      render: (_text: unknown, record: UserData) => (
        <Space size="small">
          {can("users.read") && (
            <Button
              type="primary"
              style={{ backgroundColor: "#1677ff" }}
              icon={<EyeFilled />}
              onClick={() => onAction("view", record)}
            />
          )}
          {can("users.update") && (
            <Button
              type="primary"
              style={{ backgroundColor: "#facc15", color: "black" }}
              icon={<EditFilled />}
              onClick={() => onAction("edit", record)}
            />
          )}
          {can("users.delete") && (
            <Popconfirm
              title="Hapus User"
              description="Apakah kamu yakin ingin menghapus user ini?"
              onConfirm={() => onDelete(record.id)}
              okText="Ya, Hapus"
              cancelText="Batal"
            >
              <Button type="primary" danger icon={<DeleteFilled />} />
            </Popconfirm>
          )}
          
          {/* Tombol Lihat Murid khusus Admin ke Pengajar */}
          {/* {currentUserRole === "Admin" && record.role === "Pengajar" && (
            <Button 
              type="primary" 
              icon={<TeamOutlined />}
              onClick={() => router.push(`/dashboard/users/pengajar/${record.id}/murid`)}
              style={{ backgroundColor: "#7246BA" }}
            >
              Lihat Murid
            </Button>
          )} */}
        </Space>
      ),
    },
  ];

  return (
    <Table 
      dataSource={data} 
      columns={columns} 
      rowKey="id" 
      loading={loading} 
      pagination={{ pageSize: 10 }} 
      scroll={{ x: 800 }} 
    />
  );
};
