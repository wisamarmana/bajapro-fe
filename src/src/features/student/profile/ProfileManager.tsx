"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Spin,
  Tag,
  Typography,
} from "antd";
import {
  BankOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { getStudentProfileApi } from "@/src/actions/student/studentApi";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text } = Typography;

type Role = {
  id: number;
  name: string;
  isactive?: boolean;
};

type StudentClass = {
  id: number;
  class_name: string;
  school_name?: string;
  class_code?: string;
};

type StudentProfile = {
  id: number;
  name: string;
  email?: string;
  username?: string;
  is_password_default?: boolean;
  has_roles?: Role[];
  class?: StudentClass | null;
};

type UpdateProfileForm = {
  name: string;
  email?: string;
};

const getInitials = (name?: string) => {
  const normalizedName = String(name ?? "").trim();
  if (!normalizedName) return "U";

  const parts = normalizedName.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRoleName = (roles?: Role[]) => {
  const activeRoles = Array.isArray(roles)
    ? roles.filter((role) => role.isactive !== false)
    : [];

  const names = activeRoles.map((role) => role.name.toLowerCase());

  if (names.includes("admin")) return "Administrator";
  if (names.includes("teacher") || names.includes("pengajar")) return "Pengajar";
  if (names.includes("student") || names.includes("pelajar")) return "Student";

  return activeRoles[0]?.name ?? "Pengguna";
};

export default function ProfileManager() {
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm<UpdateProfileForm>();

  useEffect(() => {
    let active = true;

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // getStudentProfileApi() sudah mengembalikan response.data.
        const profile = await getStudentProfileApi();

        if (!active) return;

        setData({
          ...profile,
          id: Number(profile.id),
          name: profile.name || profile.username || "Pengguna",
          has_roles: Array.isArray(profile.has_roles) ? profile.has_roles : [],
          class: profile.class ?? null,
        });
      } catch (error) {
        console.error("Gagal mengambil profil:", error);

        // Fallback ke data useAuth karena useAuth juga mengambil /auth/profile.
        if (active && user) {
          setData({
            ...user,
            id: Number(user.id),
            name: user.name || user.username || "Pengguna",
            has_roles: Array.isArray(user.has_roles) ? user.has_roles : [],
            class: user.class ?? null,
          });
        } else if (active) {
          setData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!authLoading) {
      void fetchProfile();
    }

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const roleName = useMemo(
    () => getRoleName(data?.has_roles),
    [data?.has_roles]
  );

  const handleOpenEditModal = () => {
    if (!data) return;

    form.setFieldsValue({
      name: data.name,
      email: data.email ?? "",
    });

    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = async (values: UpdateProfileForm) => {
    if (!data) return;

    try {
      setIsSubmitting(true);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi");
      }

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || ""
          : "";

      const response = await fetch(`${baseUrl}/users/${data.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Gagal memperbarui profil"
        );
      }

      const updatedProfile = result?.data ?? values;

      setData((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          ...updatedProfile,
          name: updatedProfile.name ?? values.name,
          email: updatedProfile.email ?? values.email,
        };
      });

      message.success("Profil berhasil diperbarui");
      setIsEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui profil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <Card>
          <Text type="danger">
            Data profil tidak ditemukan. Silakan login kembali.
          </Text>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          variant="borderless"
          style={{
            borderRadius: 20,
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            marginBottom: 24,
          }}
          styles={{ body: { padding: "32px 48px" } }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              size={100}
              style={{
                backgroundColor: "#FAAD14",
                color: "#fff",
                fontSize: 40,
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              {getInitials(data.name)}
            </Avatar>

            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Title
                level={2}
                style={{ margin: 0, color: "#1F2937", fontWeight: 800 }}
              >
                {data.name}
              </Title>

              <Text style={{ fontSize: 15, color: "#6B7280", fontWeight: 500 }}>
                {roleName}
                {data.class?.class_name ? ` • ${data.class.class_name}` : ""}
              </Text>
            </div>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card
              variant="borderless"
              style={{
                borderRadius: 20,
                boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
              }}
              styles={{ body: { padding: "32px" } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <Title level={4} style={{ margin: 0, color: "#1F2937" }}>
                  Informasi Pribadi
                </Title>

                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={handleOpenEditModal}
                >
                  Edit Profil
                </Button>
              </div>

              <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                <Descriptions.Item label="ID Pengguna">
                  {data.id}
                </Descriptions.Item>

                <Descriptions.Item label="Peran">{roleName}</Descriptions.Item>

                <Descriptions.Item label="Nama Lengkap">
                  <UserOutlined style={{ marginRight: 8 }} />
                  {data.name}
                </Descriptions.Item>

                <Descriptions.Item label="Email">
                  <MailOutlined style={{ marginRight: 8 }} />
                  {data.email || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Kelas">
                  {data.class?.class_name ? (
                    <Tag color="blue">{data.class.class_name}</Tag>
                  ) : (
                    <Tag>Belum memiliki kelas</Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Kode Kelas">
                  {data.class?.class_code || "-"}
                </Descriptions.Item>

                <Descriptions.Item label="Sekolah / Instansi" span={2}>
                  <BankOutlined style={{ marginRight: 8 }} />
                  {data.class?.school_name || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </motion.div>

      <Modal
        title="Edit Profil"
        open={isEditModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsEditModalOpen(false)}
        confirmLoading={isSubmitting}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item
            name="name"
            label="Nama Lengkap"
            rules={[
              { required: true, message: "Masukkan nama lengkap" },
              { whitespace: true, message: "Nama tidak boleh kosong" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Masukkan email yang valid" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}