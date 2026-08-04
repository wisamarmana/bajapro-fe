"use client";

import React from "react";
import { Table, Input, Select, Button, Typography, Tag, Space, Popconfirm } from "antd"; // Import Select
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, FilterOutlined } from "@ant-design/icons";
import { useApproval } from "@/src/hooks/approval/useApproval";
import { TeacherRecord, ApprovalStatus } from "@/src/types/approval";

const { Title, Text } = Typography;

export const ApprovalTable = () => {
  const {
    loading,
    searchText,
    setSearchText,
    statusFilter,       // Ambil state dari hook
    setStatusFilter,    // Ambil setter dari hook
    selectedRowKeys,
    filteredData,
    rowSelection,
    handleBulkApprove,
    handleBulkReject,
    handleRowApprove,
    handleRowReject,
  } = useApproval();

  const columns = [
    { title: "No", dataIndex: "no", key: "no", width: 60 },
    {
      title: "Status",
      key: "status",
      dataIndex: "is_approved_by_admin",
      render: (status: ApprovalStatus) => {
        if (status === 1) return <Tag color="success" style={{ borderRadius: 12, padding: "2px 12px" }}>Approve</Tag>;
        if (status === 2) return <Tag color="error" style={{ borderRadius: 12, padding: "2px 12px" }}>Reject</Tag>;
        return <Tag color="warning" style={{ borderRadius: 12, padding: "2px 12px", color: "#d97706", borderColor: "#fcd34d", background: "#fffbeb" }}>Pending</Tag>;
      },
    },
    { title: "Nama", dataIndex: "nama", key: "nama", sorter: (a: TeacherRecord, b: TeacherRecord) => a.nama.localeCompare(b.nama) },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Instansi", dataIndex: "instansi", key: "instansi", sorter: (a: TeacherRecord, b: TeacherRecord) => a.instansi.localeCompare(b.instansi) },
    { title: "NIP", dataIndex: "nip", key: "nip" },
    {
      title: "Aksi",
      key: "action",
      render: (_: unknown, record: TeacherRecord) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            size="small"
            style={{ backgroundColor: "#22c55e", borderColor: "#22c55e" }}
            onClick={() => handleRowApprove(record.key)}
            disabled={record.is_approved_by_admin !== 0}
          >
            Approve
          </Button>
          <Button
            type="primary"
            danger
            icon={<CloseCircleOutlined />}
            size="small"
            onClick={() => handleRowReject(record.key)}
            disabled={record.is_approved_by_admin !== 0}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <Title level={2} style={{ marginTop: 0, marginBottom: 4 }}>List Approval Pengajar</Title>
      <Text type="secondary" style={{ fontSize: 16 }}>Pengajuan akun pengajar</Text>

      {/* AREA FILTER & ACTIONS */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 16, flexWrap: "wrap", gap: 16 }}>
        
        {/* Kiri: Search & Filter Dropdown */}
        <Space size="middle" wrap>
          <Input
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            placeholder="Cari nama, email, atau instansi..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250, borderRadius: 8 }}
            size="large"
          />
          
          <Select
            size="large"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            style={{ width: 160 }}
            options={[
              { value: "all", label: <><FilterOutlined /> Semua Status</> },
              { value: 0, label: "Menunggu (Pending)" },
              { value: 1, label: "Disetujui (Approve)" },
              { value: 2, label: "Ditolak (Reject)" },
            ]}
          />
        </Space>

        {/* Kanan: Tombol Bulk Action */}
        <Space>
          <Popconfirm
            title="Approve Terpilih?"
            description={`Yakin ingin approve ${selectedRowKeys.length} pengajar yang dicentang?`}
            onConfirm={handleBulkApprove}
            okText="Ya, Approve"
            cancelText="Batal"
            disabled={selectedRowKeys.length === 0}
          >
            <Button type="primary" icon={<CheckCircleOutlined />} size="medium" disabled={selectedRowKeys.length === 0} style={{ backgroundColor: "#22c55e", borderColor: "#22c55e", borderRadius: 8 }}>
              Approve All
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Tolak Terpilih?"
            description={`Yakin ingin menolak ${selectedRowKeys.length} pengajar yang dicentang?`}
            onConfirm={handleBulkReject}
            okText="Ya, Tolak"
            cancelText="Batal"
            disabled={selectedRowKeys.length === 0}
          >
            <Button type="primary" danger icon={<CloseCircleOutlined />} size="medium" disabled={selectedRowKeys.length === 0} style={{ borderRadius: 8 }}>
              Reject All
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        style={{ border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden" }}
        scroll={{ x: 'max-content' }}
      />

      <style>{`
        .ant-table-thead > tr > th {
          background-color: #f3f4f6 !important; 
          font-weight: 600 !important;
          color: #374151 !important;
        }
      `}</style>
    </div>
  );
};
