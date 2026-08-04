"use client";
import { Table, Switch, Card, Row, Col, Button, Typography } from "antd";
import { usePermission, ACTIONS } from "@/src/hooks/permission/usePermission";

const { Text } = Typography;

export const PermissionTab = () => {
  const {
    loading, roles, selectedRole, handleSelectRole,
    tableDataSource, activePermissionIds, handleToggle, contextHolder
  } = usePermission();

  return (
    <div style={{ padding: 24, background: "#F8FAFC" }}>
      {contextHolder}
      <Row gutter={24}>
        {/* KOLOM KIRI: LIST ROLE DARI API */}
        <Col span={8}>
          <Card title="List Role System" style={{ borderRadius: 16 }}>
            <Table
              dataSource={roles} // <-- DATA DARI API
              rowKey="id"
              loading={loading && roles.length === 0}
              pagination={false}
              columns={[
                { title: "Role", dataIndex: "role_name", key: "name" },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Button 
                      type={selectedRole?.id === record.id ? "primary" : "default"}
                      onClick={() => handleSelectRole(record)}
                    >
                      Detail
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* KOLOM KANAN: TOGGLE AKSES */}
        <Col span={16}>
          <Card 
            title={<span>Manajemen Akses : <Text color="purple">{selectedRole?.role_name || "..."}</Text></span>}
            style={{ borderRadius: 16 }}
          >
            <Table 
              dataSource={tableDataSource} 
              loading={loading}
              pagination={false}
              columns={[
                { title: "Fitur", dataIndex: "feature", key: "feature", render: (t) => <Text strong>{t}</Text> },
                ...ACTIONS.map(act => ({
                  title: act.toUpperCase(),
                  dataIndex: act,
                  align: "center" as const,
                  render: (permId: number) => permId ? (
                    <Switch 
                      size="small"
                      checked={(activePermissionIds || []).includes(permId)}
                      onChange={(checked) => handleToggle(permId, checked)}
                      loading={loading}
                    />
                  ) : "-"
                }))
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
