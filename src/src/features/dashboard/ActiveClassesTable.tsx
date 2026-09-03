import React, { useState } from "react";
import { Card, Table, Progress, Input, Button, Tag, Typography, Select } from "antd";
import { SearchOutlined, RightOutlined } from "@ant-design/icons";
import { ActiveClass } from "@/src/types/dashboard";
import { useRouter } from "next/navigation";

const { Title } = Typography;

interface ActiveClassesTableProps {
  data: ActiveClass[];
  loading: boolean;
}

export const ActiveClassesTable: React.FC<ActiveClassesTableProps> = ({ data, loading }) => {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();

  const filteredData = data.filter(c => {
    const term = searchText.toLowerCase();
    return (
      c.className.toLowerCase().includes(term) || 
      c.teacherName.toLowerCase().includes(term) ||
      (c.courseName && c.courseName.toLowerCase().includes(term))
    );
  });

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: 60,
    },
    {
      title: "Nama Kelas",
      dataIndex: "className",
      key: "className",
      render: (text: string) => <strong>{text}</strong>
    },
    {
      title: "Nama Pengajar",
      dataIndex: "teacherName",
      key: "teacherName",
    },
    {
      title: "Course",
      dataIndex: "courseName",
      key: "courseName",
      render: (courseName: string) => (
        <Tag color="purple">{courseName || "Belum Ada Course"}</Tag>
      )
    },
    {
      title: "Jumlah Murid",
      dataIndex: "studentCount",
      key: "studentCount",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (progress: number) => (
        <Progress 
          percent={progress} 
          size="small" 
          strokeColor="#00E676" 
          railColor="#e6f7ff" 
          format={(percent) => <span style={{ fontSize: 12 }}>{percent}%</span>}
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Aktif" ? "blue" : "default"} style={{ borderRadius: 12, padding: "2px 12px", border: "1px solid #91caff", background: "transparent", color: "#0958d9" }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      render: (_: any, record: ActiveClass) => (
        <Button 
          type="text" 
          icon={<RightOutlined />} 
          onClick={() => router.push("/report")}
          style={{ color: "#531DAB" }}
        />
      ),
    }
  ];

  return (
    <Card style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <Title level={5} style={{ margin: 0 }}>Daftar Kelas Aktif</Title>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Select
            placeholder="Pilih Kelas"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => setSearchText(value || "")}
            options={Array.from(new Set(data.map(c => c.className))).map(name => ({ label: name, value: name }))}
          />
          <Select
            placeholder="Pilih Course"
            style={{ width: 180 }}
            allowClear
            onChange={(value) => setSearchText(value || "")}
            options={Array.from(new Set(data.map(c => c.courseName))).map(name => ({ label: name, value: name }))}
          />
          <Input 
            placeholder="Cari kelas atau pengajar..." 
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />} 
            style={{ width: 200, borderRadius: 8, padding: "8px 12px" }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={filteredData} 
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: 'max-content' }}
      />
    </Card>
  );
};
