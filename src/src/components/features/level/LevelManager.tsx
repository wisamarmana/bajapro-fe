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
import { LevelTable } from "@/src/components/features/level/LevelTable";
import { useLevel } from "@/src/hooks/level/useLevel";
import { LevelData } from "@/src/types/level";

const { Title } = Typography;
const { TextArea } = Input;

export default function LevelManager() {
  const {
    levels,
    loading,
    addLevel,
    editLevel,
    fetchLevelById,
    contextHolder,
    deleteLevel,
  } = useLevel();
  const [form] = Form.useForm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [viewData, setViewData] = useState<LevelData | null>(null);

  const handleAction = async (action: "add" | "edit" | "view", id?: string | number) => {
    setModalMode(action);
    setSelectedId(id || null);
    setViewData(null);
    setIsModalOpen(true); // Buka pop-up segera

    if (action === "edit" && id) {
      const dataLama = await fetchLevelById(id);
      if (dataLama) {
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue({
            levelName: dataLama.level_name,
            description: dataLama.deskripsi,
          });
        }, 50);
      }
    } else if (action === "add") {
      // Sama, beri jeda sebelum mengosongkan form
      setTimeout(() => {
        form.resetFields();
      }, 50);
    } else if (action === "view" && id) {
      const dataLama = await fetchLevelById(id);
      setViewData(dataLama || null);
    }
  };

  // Fungsi saat tombol "Simpan" di Pop-up diklik
  const handleSimpan = async () => {
    try {
      const values = await form.validateFields(); // Pastikan form tidak kosong
      let success = false;

      if (modalMode === "add") {
        success = await addLevel(values);
      } else if (modalMode === "edit" && selectedId) {
        success = await editLevel(selectedId, values);
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
      ? "Tambah Level"
      : modalMode === "edit"
        ? "Edit Level"
        : "Detail Level";

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "8px" }}>
          List Level
        </Title>
        <p style={{ color: "gray", marginBottom: "24px" }}>
          Kelola level untuk menentukan tingkat kesulitan materi
        </p>
        <LevelTable
          data={levels}
          loading={loading}
          onAction={handleAction}
          onDelete={deleteLevel}
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
              <Descriptions.Item label="Nama Level">
                <strong>{viewData.level_name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Deskripsi">
                {viewData.deskripsi}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
            <Form.Item
              label="Nama Level"
              name="levelName"
              rules={[{ required: true, message: "Nama level wajib diisi!" }]}
            >
              <Input placeholder="Type here" size="large" />
            </Form.Item>
            <Form.Item
              label="Deskripsi"
              name="description"
              rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
            >
              <TextArea placeholder="Type here" rows={4} size="large" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}

