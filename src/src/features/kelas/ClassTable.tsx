import React from "react";
import { Table, Button, Space, Tag, Popconfirm, message } from "antd";
import { EyeFilled, EditFilled, DeleteFilled, CopyOutlined } from "@ant-design/icons";
import { ClassData } from "@/src/types/kelas";
import type { TableProps } from "antd";
import { useAuth } from "@/src/hooks/useAuth";

interface ClassTableProps {
  data: ClassData[];
  loading: boolean;
  role: "Admin" | "Pengajar"; 
  onAction: (action: "view" | "edit", record: ClassData) => void;
  onDelete: (id: string | number) => void;
}

export const ClassTable: React.FC<ClassTableProps> = ({ data, loading, role, onAction, onDelete }) => {
  const { can } = useAuth();
  const columns: TableProps<ClassData>['columns'] = [
    {
      title: "No.",
      key: "index",
      width: 60,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Nama Kelas",
      dataIndex: "class_name",
      key: "class_name",
      sorter: (a: ClassData, b: ClassData) => a.class_name.localeCompare(b.class_name),
    },
    {
      title: "Kode Kelas",
      dataIndex: "class_code",
      key: "class_code",
      sorter: (a: ClassData, b: ClassData) => a.class_code.localeCompare(b.class_code),
      render: (code: string) => (
        <Space>
          <span>{code}</span>
          <Button 
            type="text" 
            icon={<CopyOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => {
              navigator.clipboard.writeText(code);
              message.success("Kode kelas disalin!");
            }} 
            size="small"
            title="Salin Kode Kelas"
          />
        </Space>
      )
    },
    
    ...(role === "Admin"
      ? [
          {
            title: "Nama Pengajar",
            dataIndex: "teacher_name",
            key: "teacher_name",
            sorter: (a: ClassData, b: ClassData) => (a.teacher_name || "").localeCompare(b.teacher_name || ""),
          },
          {
            title: "Nama Sekolah",
            dataIndex: "school_name",
            key: "school_name",
            sorter: (a: ClassData, b: ClassData) => a.school_name.localeCompare(b.school_name),
          },
        ]
      : []),

    {
      title: "Action",
      key: "action",
      width: 150,
      render: (_: unknown, record: ClassData) => (
        <Space size="small">
          {can("kelas.read") && (
            <Button 
              type="primary" 
              icon={<EyeFilled />} 
              style={{ backgroundColor: "#1677ff" }} 
              onClick={() => onAction("view", record)} 
            />
          )}
          {can("kelas.update") && (
            <Button 
              type="primary" 
              icon={<EditFilled />} 
              style={{ backgroundColor: "#faad14", color: "black" }} 
              onClick={() => onAction("edit", record)} 
            />
          )}
          {can("kelas.delete") && (
            <Popconfirm 
              title="Hapus kelas ini?" 
              onConfirm={() => onDelete(record.id)} 
              okText="Ya" 
              cancelText="Batal"
            >
              <Button type="primary" danger icon={<DeleteFilled />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Table 
      columns={columns} 
      dataSource={data} 
      rowKey="id" 
      loading={loading} 
      pagination={{ pageSize: 10 }} 
      scroll={{ x: 800 }} 
    />
  );
};
