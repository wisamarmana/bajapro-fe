"use client";

import React, { useState } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Button,
  Space,
  Popover,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useUser } from "@/src/hooks/users/useUsers";
import { UserData } from "@/src/types/users";
import { UserTable } from "@/src/components/features/users/UsersTable";
import { useAuth } from "@/src/hooks/useAuth";

const { Title } = Typography;

export default function UsersManager() {
  const { can, loading: authLoading, user } = useAuth();

  const sessionUser = user;

  const {
    users,
    loading,
    addUser,
    editUser,
    deleteUser,
    contextHolder,
    roleOptions,
    instansiOptions,
    kelasOptions,
  } = useUser(sessionUser);

  const [form] = Form.useForm();

  // Gunakan useState biasa — lebih reliable daripada Form.useWatch di dalam Modal
  const [selectedFormRole, setSelectedFormRole] = useState<string | undefined>(undefined);

  const currentUserRole =
    sessionUser?.role_id === 1
      ? "Admin"
      : sessionUser?.role_id === 2
        ? "Teacher"
        : "Students";
  const currentUserId = sessionUser?.id;

  // --- STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [viewData, setViewData] = useState<UserData | null>(null);

  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState<string | null>(null);
  const [filterInstansi, setFilterInstansi] = useState<string | null>(null);
  const [filterKelas, setFilterKelas] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --- LOGIKA FILTERING ---
  const filteredUsers = users.filter((u) => {
    if (currentUserRole === "Teacher") {
      if (u.role !== "Students" && u.id !== currentUserId) {
         return false;
      }
    }
    if (searchText && !u.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (filterRole && u.role !== filterRole) return false;
    if (filterInstansi && u.instansi_sekolah !== filterInstansi) return false;
    if (filterKelas && u.class_name !== filterKelas) return false;
    return true;
  });

  // --- HANDLERS ---
  const handleAction = (action: "add" | "edit" | "view", record?: UserData) => {
    setModalMode(action);
    setSelectedId(record?.id || null);
    setIsModalOpen(true);

    if (action === "view" && record) {
      setViewData(record);
    } else {
      setViewData(null);
      if (action === "add") {
        if (currentUserRole === "Teacher") {
          setSelectedFormRole("Students");
          setTimeout(() => {
            form.resetFields();
            form.setFieldsValue({ role: "Students" });
          }, 50);
        } else {
          setSelectedFormRole(undefined); // reset pilihan role
          setTimeout(() => {
            form.resetFields();
          }, 50);
        }
      } else if (record) {
        setSelectedFormRole(record.role);
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue(record);
        }, 50);
      }
    }
  };

  const handleSimpan = async () => {
    try {
      const values = await form.validateFields();
      let success = false;
      if (modalMode === "add") success = await addUser(values);
      else if (modalMode === "edit" && selectedId)
        success = await editUser(selectedId.toString(), values);
      if (success) {
        setIsModalOpen(false);
        setSelectedFormRole(undefined);
      }
    } catch (error) {
      console.log("Validasi form gagal", error);
    }
  };

  const filterContent = (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "220px" }}>
      {currentUserRole === "Admin" && (
        <>
          <div>
            <Typography.Text strong>Role</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="Semua Role"
              allowClear
              value={filterRole}
              onChange={setFilterRole}
              options={roleOptions}
            />
          </div>
          <div>
            <Typography.Text strong>Instansi</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: "4px" }}
              placeholder="Semua Instansi"
              allowClear
              value={filterInstansi}
              onChange={setFilterInstansi}
              options={instansiOptions}
            />
          </div>
        </>
      )}

        <div>
          <Typography.Text strong>Kelas</Typography.Text>
          <Select
            style={{ width: "100%", marginTop: "4px" }}
            placeholder="Semua Kelas"
            allowClear
            value={filterKelas}
            onChange={setFilterKelas}
            options={kelasOptions}
          />
        </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", flexWrap: "wrap", gap: "8px" }}>
        <Button type="dashed" onClick={() => {
          setFilterRole(null);
          setFilterInstansi(null);
          setFilterKelas(null);
        }}>Reset</Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#7246BA", borderRadius: "6px" }}
          onClick={() => setIsFilterOpen(false)}
        >
          Terapkan
        </Button>
      </div>
    </div>
  );

  // --- FORM: field kondisional berdasarkan selectedFormRole (useState, bukan Form.useWatch) ---
  const renderFormFields = () => (
    <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
      {/* Nama + Role */}
      <div style={{ display: "flex", gap: "16px" }}>
        <Form.Item label="Nama User" name="name" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Input placeholder="Masukkan nama lengkap" size="large" />
        </Form.Item>
        <Form.Item label="Role" name="role" style={{ flex: 1 }} rules={[{ required: true }]}>
          <Select
            placeholder="Pilih Role"
            size="large"
            options={currentUserRole === "Teacher" ? [{ label: "Students", value: "Students" }] : roleOptions}
            disabled={currentUserRole === "Teacher"}
            // Saat user pilih role, update state lokal (bukan Form.useWatch)
            onChange={(value) => setSelectedFormRole(value as string)}
          />
        </Form.Item>
      </div>

      {/* STUDENTS: Dropdown Kelas (wajib) */}
      {selectedFormRole === "Students" && (
        <Form.Item
          label="Kelas"
          name="class_name"
          rules={[{ required: true, message: "Kelas wajib dipilih!" }]}
        >
          <Select
            placeholder="Pilih Kelas"
            size="large"
            options={kelasOptions}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>
      )}

      {/* TEACHER: NIP (opsional) + Instansi (wajib) */}
      {selectedFormRole === "Teacher" && (
        <>
          <Form.Item label="NIP" name="nip">
            <Input placeholder="Masukkan NIP (opsional)" size="large" />
          </Form.Item>
          <Form.Item
            label="Nama Instansi / Sekolah"
            name="instansi_sekolah"
            rules={[{ required: true, message: "Instansi/Sekolah wajib diisi!" }]}
          >
            <Input placeholder="Contoh: SMAN 1 Malang / Polinema" size="large" />
          </Form.Item>
        </>
      )}

      {/* EMAIL & PASSWORD — untuk semua role */}
      <div style={{ display: "flex", gap: "16px" }}>
        <Form.Item
          label="Email"
          name="email"
          style={{ flex: 1 }}
          rules={[{ required: true, type: "email" }]}
        >
          <Input placeholder="contoh@email.com" size="large" />
        </Form.Item>
        {modalMode === "add" && (
          <Form.Item label="Password" name="password" style={{ flex: 1 }} rules={[{ required: true }]}>
            <Input.Password placeholder="Masukkan password" size="large" />
          </Form.Item>
        )}
      </div>
    </Form>
  );

  if (!authLoading && !can("users.read")) {
    return (
      <div style={{ padding: 24, textAlign: "center", marginTop: 50 }}>
        <Typography.Title level={3} style={{ color: "#ff4d4f" }}>
          Akses Ditolak
        </Typography.Title>
        <Typography.Text>
          Anda tidak memiliki izin untuk melihat halaman Pengguna.
        </Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "4px" }}>List User</Title>
        <p style={{ color: "gray", marginTop: "0px", marginBottom: "24px" }}>
          Kelola pengguna dan profilnya
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "16px" }}>
          {can("users.create") && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{ backgroundColor: "#7246BA", borderRadius: "8px" }}
              onClick={() => handleAction("add")}
            >
              Tambah User
            </Button>
          )}
          <Space>
            <Input
              size="large"
              placeholder="Cari Nama"
              prefix={<SearchOutlined />}
              style={{ borderRadius: "8px", width: "250px" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Popover
              content={filterContent}
              title="Filter Data"
              trigger="click"
              open={isFilterOpen}
              onOpenChange={setIsFilterOpen}
              placement="bottomRight"
            >
              <Button size="large" icon={<FilterOutlined />} style={{ borderRadius: "8px" }}>
                Filter
              </Button>
            </Popover>
          </Space>
        </div>

        <UserTable
          data={filteredUsers}
          loading={loading}
          currentUserRole={currentUserRole}
          onAction={handleAction}
          onDelete={deleteUser}
        />
      </Card>

      <Modal
        title={
          <span style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}>
            {modalMode === "add" ? "Tambah User" : modalMode === "edit" ? "Edit User" : "Detail User"}
          </span>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedFormRole(undefined);
        }}
        width={600}
        destroyOnHidden   // Hancurkan form saat modal ditutup supaya state bersih
        footer={
          modalMode === "view" ? (
            <Button size="large" onClick={() => setIsModalOpen(false)}>Tutup</Button>
          ) : (
            <Button
              size="large"
              type="primary"
              style={{ backgroundColor: "#7246BA" }}
              onClick={handleSimpan}
              loading={loading}
            >
              Simpan
            </Button>
          )
        }
      >
        {modalMode === "view" ? (
          viewData ? (
            <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
              <Descriptions.Item label="Nama User"><strong>{viewData.name}</strong></Descriptions.Item>
              <Descriptions.Item label="Role">{viewData.role}</Descriptions.Item>
              <Descriptions.Item label="Email">{viewData.email}</Descriptions.Item>
              {viewData.role === "Teacher" && (
                <>
                  <Descriptions.Item label="NIP">{viewData.nip || "-"}</Descriptions.Item>
                  <Descriptions.Item label="Instansi">{viewData.instansi_sekolah || "-"}</Descriptions.Item>
                </>
              )}
              {viewData.role === "Students" && (
                <Descriptions.Item label="Kelas">{viewData.class_name || "-"}</Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          renderFormFields()
        )}
      </Modal>
    </div>
  );
}
