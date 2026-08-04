"use client";

import React, { useState } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  Typography,
  Descriptions,
  Tag,
  Button,
} from "antd";
import { RoleTable } from "@/src/components/features/roles/RoleTable";
import { useRole } from "@/src/hooks/roles/useRole";
import { RoleData } from "@/src/types/roles";

const { Title } = Typography;

export default function RolesManager() {
  const {
    roles,
    loading,
    addRole,
    editRole,
    fetchRoleById,
    contextHolder,
    deleteRole,
  } = useRole();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [viewData, setViewData] = useState<RoleData | null>(null);

  const handleAction = async (action: "add" | "edit" | "view", id?: string | number) => {
    setModalMode(action);
    setSelectedId(id || null);
    setViewData(null);
    setIsModalOpen(true); // Buka pop-up segera

    if (action === "edit" && id) {
      const dataLama = await fetchRoleById(id);
      if (dataLama) {
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue({
            roleName: dataLama.role_name,
          });
        }, 50);
      }
    } else if (action === "add") {
      // Sama, beri jeda sebelum mengosongkan form
      setTimeout(() => {
        form.resetFields();
      }, 50);
    } else if (action === "view" && id) {
      const dataLama = await fetchRoleById(id);
      setViewData(dataLama || null);
    }
  };

  // Fungsi saat tombol "Simpan" di Pop-up diklik
  const handleSimpan = async () => {
    try {
      const values = await form.validateFields(); // Pastikan form tidak kosong
      let success = false;

      if (modalMode === "add") {
        success = await addRole(values);
      } else if (modalMode === "edit" && selectedId) {
        success = await editRole(selectedId, values);
      }

      if (success) {
        setIsModalOpen(false); // Otomatis tutup modal kalau API sukses
      }
    } catch (error) {
      console.log("Validasi form gagal", error);
    }
  };

  // Judul modal berubah-ubah sesuai aksi yang diklik
  const modalTitle =
    modalMode === "add"
      ? "Tambah Role"
      : modalMode === "edit"
        ? "Edit Role"
        : "Detail Role";

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "8px" }}>
          List Role
        </Title>
        <p style={{ color: "gray", marginBottom: "24px" }}>
          Kelola role untuk menentukan tingkat akses pengguna
        </p>
        <RoleTable
          data={roles}
          loading={loading}
          onAction={handleAction}
          onDelete={deleteRole}
        />
      </Card>

      <Modal
        title={
          <span
            style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}
          >
            {modalTitle}
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={
          modalMode === "view" ? (
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              Tutup
            </Button>
          ) : (
            <>
              <Button size="large" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                size="large"
                type="primary"
                style={{ backgroundColor: "#7246BA" }}
                onClick={handleSimpan}
                loading={loading}
              >
                Simpan
              </Button>
            </>
          )
        }
      >
        {modalMode === "view" ? (
          viewData ? (
            <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
              <Descriptions.Item label="Nama Role">
                <strong>{viewData.role_name}</strong>
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
            <Form.Item
              label="Nama Role"
              name="roleName"
              rules={[{ required: true, message: "Nama role wajib diisi!" }]}
            >
              <Input placeholder="Type here" size="large" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

