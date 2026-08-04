import React from "react";
import { Card, Row, Col, Typography, Spin } from "antd";
import { DashboardStats } from "@/src/types/dashboard";
import { BankOutlined, TeamOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface StatCardsProps {
  stats: DashboardStats | null;
  role: "Admin" | "Pengajar";
  loading: boolean;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, role, loading }) => {
  if (loading || !stats) {
    return <Spin size="large" />;
  }

  const renderCard = (title: string, value: number | string, icon: React.ReactNode, iconBg: string) => (
    <Card style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "none", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <Text type="secondary">{title}</Text>
        <div style={{ backgroundColor: iconBg, padding: 8, borderRadius: 8, color: "white", display: "flex" }}>
          {icon}
        </div>
      </div>
      <Title level={2} style={{ margin: 0 }}>{value}</Title>
    </Card>
  );

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {role === "Admin" ? (
        <>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Menunggu Persetujuan", stats.pendingApproval, <ClockCircleOutlined />, "#ff4d4f")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Jumlah Kelas", stats.totalClasses, <BankOutlined />, "#52c41a")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Jumlah Pelajar", stats.totalStudents, <TeamOutlined />, "#faad14")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Jumlah Pengajar", stats.totalTeachers || 0, <UserOutlined />, "#13c2c2")}
          </Col>
        </>
      ) : (
        <>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Jumlah Kelas", stats.totalClasses, <BankOutlined />, "#52c41a")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Jumlah Pelajar", stats.totalStudents, <TeamOutlined />, "#faad14")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Menunggu Penilaian", stats.pendingApproval, <ClockCircleOutlined />, "#ff4d4f")}
          </Col>
          <Col xs={24} sm={12} lg={6}>
            {renderCard("Tugas Disetujui", stats.approvedItems || 0, <CheckCircleOutlined />, "#13c2c2")}
          </Col>
        </>
      )}
    </Row>
  );
};
