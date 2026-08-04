"use client";

import React, { useState } from "react";
import {
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Typography,
  Descriptions,
  Button,
  Upload,
  message,
  Spin,
} from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import { BadgeTable } from "@/src/components/features/badge/BadgeTable";
import { useBadge } from "@/src/hooks/badge/useBadge";
import { BadgeData } from "@/src/types/badge";
import Image from "next/image";
import type { UploadProps } from "antd";

const { Title } = Typography;

/** Upload gambar ke server dan kembalikan URL publik */
const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Gagal upload gambar ke server");
  const data = await res.json();
  return data.url as string; // e.g. "/uploads/1234567890-badge.png"
};

interface UploadWrapperProps extends Omit<UploadProps, "value" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
}

const UploadWrapper: React.FC<UploadWrapperProps> = ({
  value,
  onChange,
  ...rest
}) => {
  return <Upload {...rest} />;
};

export default function BadgeManager() {
  const {
    badges,
    loading,
    addBadge,
    editBadge,
    fetchBadgeById,
    contextHolder,
    deleteBadge,
  } = useBadge();

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [viewData, setViewData] = useState<BadgeData | null>(null);

  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const handleAction = async (action: "add" | "edit" | "view", id?: string | number) => {
    setModalMode(action);
    setSelectedId(id || null);
    setViewData(null);
    setIsModalOpen(true);
    setImageUrl("");

    if (action === "edit" && id) {
      const dataLama = await fetchBadgeById(id);
      if (dataLama) {
        setTimeout(() => {
          form.resetFields();
          form.setFieldsValue({
            name: dataLama.name,
            image: dataLama.image,
            minScore: dataLama.minScore,
            maxScore: dataLama.maxScore,
          });
          setImageUrl(dataLama.image);
        }, 50);
      }
    } else if (action === "add") {
      setTimeout(() => {
        form.resetFields();
      }, 50);
    } else if (action === "view" && id) {
      const dataLama = await fetchBadgeById(id);
      setViewData(dataLama || null);
    }
  };

  const handleSimpan = async () => {
    try {
      const values = await form.validateFields();
      let success = false;

      if (modalMode === "add") {
        success = await addBadge(values);
      } else if (modalMode === "edit" && selectedId) {
        success = await editBadge(selectedId, values);
      }

      if (success) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.log("Validasi form gagal", error);
    }
  };

  const modalTitle =
    modalMode === "add"
      ? "Tambah Badge"
      : modalMode === "edit"
        ? "Edit Badge"
        : "Detail Badge";

  return (
    <div style={{ padding: "24px" }}>
      {contextHolder}
      <Card style={{ borderRadius: "12px", padding: "12px" }}>
        <Title level={3} style={{ marginBottom: "0px" }}>
          List Badge
        </Title>
        <p style={{ color: "gray", marginTop: "4px" }}>
          Kelola lencana pencapaian berdasarkan skor pengguna
        </p>
        <BadgeTable
          data={badges}
          loading={loading}
          onAction={handleAction}
          onDelete={deleteBadge}
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
              <Descriptions.Item label="Ikon">
                <Image
                  src={viewData.image}
                  alt="badge"
                  style={{ width: "60px", borderRadius: "8px" }}
                  width={60}
                  height={60}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Nama Badge">
                <strong>{viewData.name}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Rentang Skor">
                {viewData.minScore} - {viewData.maxScore}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <p>Memuat data...</p>
          )
        ) : (
          <Form form={form} layout="vertical" style={{ marginTop: "24px" }}>
            <Form.Item
              label="Nama Badge"
              name="name"
              rules={[{ required: true, message: "Nama badge wajib diisi!" }]}
            >
              <Input placeholder="Misal: Si Jagoan" size="large" />
            </Form.Item>

            <Form.Item
              label="Ikon Badge (Maks 2MB, JPG/PNG)"
              name="image"
              rules={[{ required: true, message: "Ikon wajib diupload!" }]}
            >
              <UploadWrapper
                name="image"
                listType="picture-card"
                showUploadList={false}
                beforeUpload={async (file) => {
                  const isJpgOrPng =
                    file.type === "image/jpeg" || file.type === "image/png";
                  if (!isJpgOrPng) {
                    message.error("Gagal! Hanya bisa upload file JPG atau PNG.");
                    return Upload.LIST_IGNORE;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    message.error("Gagal! Ukuran gambar maksimal 2MB.");
                    return Upload.LIST_IGNORE;
                  }
                  try {
                    setUploading(true);
                    const formData = new FormData();
                    formData.append("file", file as unknown as File);
                    try {
                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await response.json();
                      if (data.success) {
                        setImageUrl(data.url);
                        form.setFieldsValue({ image: data.url });
                      } else {
                        message.error(data.error || "Gagal mengunggah gambar.");
                      }
                    } catch (error) {
                      message.error("Terjadi kesalahan saat mengunggah gambar.");
                    }
                  } finally {
                    setUploading(false);
                  }
                  return false;
                }}
              >
                {uploading ? (
                  <div>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                    <div style={{ marginTop: 8 }}>Mengupload...</div>
                  </div>
                ) : imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="ikon"
                    width={100}
                    height={100}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload Gambar</div>
                  </div>
                )}
              </UploadWrapper>
            </Form.Item>

            <div style={{ display: "flex", gap: "16px" }}>
              <Form.Item
                style={{ flex: 1 }}
                label="Skor Minimal"
                name="minScore"
                rules={[{ required: true, message: "Wajib diisi!" }]}
              >
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>

              <Form.Item
                style={{ flex: 1 }}
                label="Skor Maksimal"
                name="maxScore"
                rules={[{ required: true, message: "Wajib diisi!" }]}
              >
                <InputNumber style={{ width: "100%" }} size="large" min={0} />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
