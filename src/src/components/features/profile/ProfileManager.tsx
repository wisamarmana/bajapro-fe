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
  Typography,
} from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text } = Typography;

interface UserRole {
  id: number;
  name: string;
  isactive?: boolean;
}

interface UserClass {
  id: number;
  class_name: string;
  school_name?: string;
  class_code?: string;
}

interface ProfileUser {
  id: number;
  name: string;
  username?: string;
  email?: string;
  is_password_default?: boolean;
  has_roles?: UserRole[];
  class?: UserClass | null;
}

interface UpdateProfileForm {
  name: string;
  email: string;
}

const getRoleName = (roles?: UserRole[]): string => {
  const activeRoles = Array.isArray(roles)
    ? roles.filter((role) => role.isactive !== false)
    : [];

  const roleNames = activeRoles.map((role) =>
    role.name.toLowerCase()
  );

  if (roleNames.includes("admin")) {
    return "Administrator";
  }

  if (
    roleNames.includes("teacher") ||
    roleNames.includes("pengajar")
  ) {
    return "Pengajar";
  }

  if (
    roleNames.includes("student") ||
    roleNames.includes("pelajar")
  ) {
    return "Pelajar";
  }

  return activeRoles[0]?.name ?? "Pengguna";
};

const getRoleKey = (
  roles?: UserRole[]
): "admin" | "teacher" | "student" | "user" => {
  const names = Array.isArray(roles)
    ? roles
      .filter((role) => role.isactive !== false)
      .map((role) => role.name.toLowerCase())
    : [];

  if (names.includes("admin")) {
    return "admin";
  }

  if (
    names.includes("teacher") ||
    names.includes("pengajar")
  ) {
    return "teacher";
  }

  if (
    names.includes("student") ||
    names.includes("pelajar")
  ) {
    return "student";
  }

  return "user";
};

const getAvatarBackground = (
  role: ReturnType<typeof getRoleKey>
) => {
  switch (role) {
    case "admin":
      return "#FAAD14";

    case "teacher":
      return "#52C41A";

    case "student":
      return "#4F46E5";

    default:
      return "#8C8C8C";
  }
};

export default function ProfileManager() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [userInfo, setUserInfo] =
    useState<ProfileUser | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [form] = Form.useForm<UpdateProfileForm>();

  useEffect(() => {
    if (!user) {
      setUserInfo(null);
      return;
    }

    setUserInfo({
      ...user,
      id: Number(user.id),
      name:
        user.name ||
        user.username ||
        "Pengguna",
      has_roles: Array.isArray(user.has_roles)
        ? user.has_roles
        : [],
      class: user.class ?? null,
    });
  }, [user]);

  const roleKey = useMemo(
    () => getRoleKey(userInfo?.has_roles),
    [userInfo?.has_roles]
  );

  const roleName = useMemo(
    () => getRoleName(userInfo?.has_roles),
    [userInfo?.has_roles]
  );

  const handleOpenEditModal = () => {
    if (!userInfo) return;

    form.setFieldsValue({
      name: userInfo.name,
      email: userInfo.email ?? "",
    });

    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    if (isSubmitting) return;

    form.resetFields();
    setIsEditModalOpen(false);
  };

  const handleUpdateProfile = async (
    values: UpdateProfileForm
  ) => {
    if (!userInfo) return;

    try {
      setIsSubmitting(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000/api/v1";

      const response = await fetch(
        `${baseUrl}/users/${userInfo.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                Authorization: `Bearer ${token}`,
              }
              : {}),
          },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
          }),
        }
      );

      const responseBody = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.message ||
          responseBody?.error ||
          "Gagal memperbarui profil"
        );
      }

      const updatedProfile =
        responseBody?.data ?? values;

      setUserInfo((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          ...updatedProfile,
          name:
            updatedProfile.name ??
            values.name,
          email:
            updatedProfile.email ??
            values.email,
        };
      });

      message.success(
        "Profil berhasil diperbarui"
      );

      form.resetFields();
      setIsEditModalOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memperbarui profil";

      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
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

  if (!userInfo) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Text type="danger">
            Data profil tidak ditemukan. Silakan
            login kembali.
          </Text>
        </Card>
      </div>
    );
  }

  const avatarInitial =
    userInfo.name?.trim().charAt(0).toUpperCase() ||
    "U";

  return (
    <div style={{ padding: 24 }}>
      <Card
        style={{
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Row gutter={[24, 24]} align="middle">
          <Col
            xs={24}
            sm={8}
            md={6}
            style={{ textAlign: "center" }}
          >
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{
                backgroundColor:
                  getAvatarBackground(roleKey),
                color: "#fff",
                fontSize: 48,
              }}
            >
              {avatarInitial}
            </Avatar>

            <Title
              level={3}
              style={{
                marginTop: 16,
                marginBottom: 4,
              }}
            >
              {userInfo.name}
            </Title>

            <Text
              type="secondary"
              style={{ fontSize: 16 }}
            >
              {roleName}
            </Text>
          </Col>

          <Col xs={24} sm={16} md={18}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Title
                level={4}
                style={{ margin: 0 }}
              >
                Informasi Pengguna
              </Title>

              <Button
                type="primary"
                onClick={handleOpenEditModal}
              >
                Edit Profil
              </Button>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID Pengguna">
                {userInfo.id}
              </Descriptions.Item>

              <Descriptions.Item label="Nama Lengkap">
                {userInfo.name}
              </Descriptions.Item>

              {userInfo.username && (
                <Descriptions.Item label="Username">
                  {userInfo.username}
                </Descriptions.Item>
              )}

              {userInfo.email && (
                <Descriptions.Item label="Email">
                  {userInfo.email}
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Peran">
                {roleName}
              </Descriptions.Item>

              {userInfo.class && (
                <>
                  <Descriptions.Item label="Kelas">
                    {userInfo.class.class_name}
                  </Descriptions.Item>

                  {userInfo.class.class_code && (
                    <Descriptions.Item label="Kode Kelas">
                      {userInfo.class.class_code}
                    </Descriptions.Item>
                  )}

                  {userInfo.class.school_name && (
                    <Descriptions.Item label="Sekolah">
                      {userInfo.class.school_name}
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Modal
        title="Edit Profil"
        open={isEditModalOpen}
        onOk={() => form.submit()}
        onCancel={handleCloseEditModal}
        confirmLoading={isSubmitting}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="name"
            label="Nama Lengkap"
            rules={[
              {
                required: true,
                message: "Masukkan nama lengkap",
              },
              {
                whitespace: true,
                message:
                  "Nama tidak boleh hanya berisi spasi",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Masukkan email",
              },
              {
                type: "email",
                message: "Masukkan email yang valid",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}