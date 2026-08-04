import React from "react";
import { Card, Typography, Avatar, Button } from "antd";
import { ApprovalItem } from "@/src/types/dashboard";
import { UserOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

interface ApprovalListProps {
  data: ApprovalItem[];
  role: "Admin" | "Pengajar";
}

export const ApprovalList: React.FC<ApprovalListProps> = ({ data, role }) => {
  const title = role === "Admin" ? "Persetujuan Pengajar Baru" : "Tugas Perlu Dinilai";

  return (
    <Card 
      style={{ borderRadius: 12, border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%", display: "flex", flexDirection: "column" }}
      styles={{ body: { padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column" } }}
    >
      <Title level={5} style={{ margin: 0, marginBottom: 24 }}>{title}</Title>
      
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {data.map((item, index) => (
            <div 
              key={index} 
              style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "12px 0"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#8c8c8c" }} />
                <div>
                  <Text strong style={{ display: "block" }}>{item.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>{item.context}</Text>
                </div>
              </div>
              <Link 
                href={role === "Admin" ? "/approval" : "/report"} 
                style={{ color: "#531DAB", fontSize: "14px" }}
              >
                Detail
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href={role === "Admin" ? "/approval" : "/report"}>
          <Button block style={{ borderRadius: 8, color: "#531DAB", borderColor: "#531DAB" }}>
            Lihat semua
          </Button>
        </Link>
      </div>
    </Card>
  );
};
