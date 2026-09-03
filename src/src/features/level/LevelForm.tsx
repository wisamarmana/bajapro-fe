// src/app/(dashboard)/(master)/level/components/LevelModal.tsx
"use client";

import React, { useEffect } from "react";
import { Modal, Form, Input, Descriptions, Tag, Button } from "antd";
import { LevelData } from "@/src/types/level";

const { TextArea } = Input;

interface LevelModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  data: LevelData | null;
  loading: boolean;
  onCancel: () => void;
  onSave: (values: unknown) => void;
}

export const LevelModal = ({ open, mode, data, loading, onCancel, onSave }: LevelModalProps) => {
  const [form] = Form.useForm();

  // Reset/Set field saat data berubah
  useEffect(() => {
    if (open) {
      if ((mode === "edit" || mode === "view") && data) {
        form.setFieldsValue({
          levelName: data.level_name,
          description: data.deskripsi,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, data, form]);

  const modalTitle = mode === "add" ? "Tambah Level" : mode === "edit" ? "Edit Level" : "Detail Level";

  return (
    <Modal
      title={<span style={{ color: "#7246BA", fontSize: "20px", fontWeight: "bold" }}>{modalTitle}</span>}
      open={open}
      onCancel={onCancel}
      footer={
        mode === "view" ? (
          <Button size="large" onClick={onCancel}>Tutup</Button>
        ) : (
          <>
            <Button size="large" onClick={onCancel}>Batal</Button>
            <Button 
              size="large" 
              type="primary" 
              style={{ backgroundColor: "#7246BA" }} 
              onClick={() => form.validateFields().then(onSave)}
              loading={loading}
            >
              Simpan
            </Button>
          </>
        )
      }
    >
      {mode === "view" && data ? (
        <Descriptions column={1} bordered style={{ marginTop: "24px" }}>
          <Descriptions.Item label="Nama Level"><strong>{data.level_name}</strong></Descriptions.Item>
          <Descriptions.Item label="Deskripsi">{data.deskripsi}</Descriptions.Item>
        </Descriptions>
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
  );
};
