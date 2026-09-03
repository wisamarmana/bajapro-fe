"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message, Image, App } from "antd";
import { UploadOutlined, SaveOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { CourseRecord, CourseFormData } from "@/src/types/course";
import { useAuth } from "@/src/hooks/useAuth";

const { TextArea } = Input;

interface CourseDetailProps {
  initialData: CourseRecord | null;
  onSave: (values: CourseFormData) => Promise<void>;
  loading: boolean;
}

export const CourseDetailTab: React.FC<CourseDetailProps> = ({
  initialData,
  onSave,
  loading
}) => {
  const { can } = useAuth();
  const canEdit = can('course.update');
  const [form] = Form.useForm();
  const { message: messageApi } = App.useApp();

  const [previewImage, setPreviewImage] = useState<string>(
    initialData?.img_thumbnail || ""
  );

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (
      img.startsWith("blob:") ||
      img.startsWith("/") ||
      img.startsWith("http://") ||
      img.startsWith("https://")
    ) {
      return img;
    }
    return `/uploads/courses/${img}`;
  };

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        course_name: initialData.course_name,
        description: initialData.description,
      });
      setPreviewImage(initialData.img_thumbnail || "");
    }
  }, [initialData, form]);


  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleBeforeUpload = (file: RcFile) => {
    const isAllowedType = ["image/png", "image/jpeg", "image/jpg"].includes(file.type);
    if (!isAllowedType) {
      messageApi.error("Hanya bisa upload file PNG/JPG/JPEG!");
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error("Ukuran gambar maksimal 2MB!");
      return Upload.LIST_IGNORE;
    }

    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));

    return false;
  };

  const onFinish = async (values: CourseFormData) => {
    let finalImageUrl = previewImage;

    // Jika ada file baru yang dipilih, upload file ke API
    if (selectedFile) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/upload?type=course", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error("Gagal mengunggah gambar");
        
        const data = await res.json();
        finalImageUrl = data.filename; // Store filename in database
      } catch (err) {
        messageApi.error("Terjadi kesalahan saat mengunggah gambar");
        setUploading(false);
        return; // Jangan lanjutkan simpan form jika upload gagal
      } finally {
        setUploading(false);
      }
    }

    const payload = {
      ...values,
      img_thumbnail: finalImageUrl, 
    };
    await onSave(payload); 
  };

  return (
    <>
      <style>{`
        .ant-input-disabled, 
        .ant-select-disabled .ant-select-selection-item,
        .ant-input-number-disabled input {
          color: rgba(0, 0, 0, 0.85) !important;
          background-color: #f5f5f5 !important;
        }
      `}</style>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        <fieldset disabled={!canEdit} style={{ border: "none", padding: 0, margin: 0 }}>
          <Form.Item
            label="Nama Course"
            name="course_name"
            rules={[{ required: true, message: "Nama course wajib diisi!" }]}
          >
            <Input placeholder="Contoh: Java Basic 1" />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
            rules={[{ required: true, message: "Deskripsi wajib diisi!" }]}
          >
            <TextArea placeholder="Tuliskan deskripsi..." rows={4} />
          </Form.Item>

          <Form.Item label="Course Thumbnail">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
              
              {/* BOX PREVIEW GAMBAR */}
              {previewImage && (
                <Image
                  src={getImageUrl(previewImage)}
                  alt="Preview"
                  style={{ width: 300, height: 300, objectFit: "cover", borderRadius: 8, border: "1px solid #d9d9d9" }}
                />
              )}

              {/* TOMBOL UPLOAD & HAPUS HANYA JIKA BISA EDIT */}
              {canEdit && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <Upload
                    accept=".png,.jpg,.jpeg"
                    showUploadList={false}
                    beforeUpload={handleBeforeUpload}
                  >
                    <Button icon={<UploadOutlined />} size="medium">Pilih Gambar</Button>
                  </Upload>

                  {previewImage && (
                    <Button 
                      danger 
                      type="default"
                      size="medium" 
                      onClick={() => setPreviewImage("")}
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Form.Item>
        </fieldset>

        {canEdit && (
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading || uploading} 
            icon={<SaveOutlined />}
          >
            Simpan
          </Button>
        )}
      </Form>
    </>
  );
};
