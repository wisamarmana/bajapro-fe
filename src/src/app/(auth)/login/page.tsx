"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// import { signIn } from "next-auth/react";
const { Title, Text } = Typography;

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = async (values: LoginValues) => {
    setLoading(true);

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        credentials: "include", // agar browser menerima Set-Cookie dari backend
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.toLowerCase(),
          password: values.password,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        messageApi.error(result.message || "Email atau Password salah!");
        return;
      }

      const user = result.data.user;
      const role = user.has_roles?.[0]?.name?.toLowerCase() || "";

      messageApi.success("Login berhasil!");

      router.refresh();

      setTimeout(() => {
        if (role === "student") {
          router.replace("/student/dashboard");
        } else if (role === "teacher" || role === "super") {
          router.replace("/dashboard");
        } else {
          router.replace("/");
        }
      }, 300);
    } catch (error) {
      console.error(error);
      messageApi.error("Terjadi kesalahan saat menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <style>{`
        /* Memaksa background terang sejak HTML pertama kali dimuat */
        html, body {
          background-color: #ffffff !important;
          color-scheme: light !important;
          margin: 0;
          padding: 0;
        }
        
        .auth-container {
          display: flex;
          min-height: 100vh;
          background-color: #ffffff; 
          overflow: hidden;
        }

        /* Form di Kiri */
        .form-side {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 10%;
          position: relative;
          background-color: #ffffff;
          overflow-y: auto;
        }

        /* Banner di Kanan */
        .banner-side {
          flex: 1;
          background-color: #5B21B6;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          padding: 40px;
        }

        /* MEDIA QUERIES UNTUK RESPONSIVE */
        @media (max-width: 992px) {
          .banner-side {
            display: none; /* Banner hilang di layar HP/Tablet */
          }
          
          .form-side {
            padding: 40px 24px;
            align-items: center;
          }

          .form-content {
            width: 100%;
            max-width: 480px;
          }

          .auth-logo-wrapper {
            justify-content: center !important;
          }
        }
      `}</style>

      <div className="auth-container">

        {/* BAGIAN KIRI: FORM */}
        <div className="form-side">
          <div className="form-content" style={{ maxWidth: 400, width: "100%" }}>

            <Title level={2}>Login</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
              Login to access your bajapro account
            </Text>

            <Form layout="vertical" onFinish={handleLogin} requiredMark={false}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email wajib diisi" },
                  { type: "email", message: "Format email salah" },
                ]}
              >
                <Input size="large" placeholder="ex. budi@gmail.com" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Password wajib diisi" }]}
              >
                <Input.Password
                  size="large"
                  placeholder="••••••••"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{
                  background: "linear-gradient(90deg, #5B21B6 0%, #7C3AED 100%)",
                  marginTop: 16,
                  border: "none",
                  borderRadius: 8,
                }}
              >
                Login
              </Button>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text>
                Dont have an account?{" "}
                <Link href="/register" style={{ color: "#EF4444" }}>
                  Sign up
                </Link>
              </Text>
              <br />
              <Text style={{ fontSize: 13, marginTop: 8, display: "inline-block" }}>
                Sudah mendaftar sebagai Pengajar?{" "}
                <Link href="/waiting-approval" style={{ color: "#5B21B6", fontWeight: "bold" }}>
                  Cek Status
                </Link>
              </Text>
            </div>
          </div>
        </div>

        {/* BAGIAN KANAN: BANNER UNGU */}
        <div className="banner-side">
          <div
            style={{
              width: 400,
              height: 300,
              backgroundColor: "#ffffff20",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
              padding: 20, // Tambah padding biar gambar gak terlalu mepet border
            }}
          >
            <Image
              src="/assets/login-img.png"
              alt="Illustration"
              width={400}
              height={300}
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
          <div style={{ maxWidth: 400, textAlign: "center" }}>
            <Title level={2} style={{ color: "white", marginBottom: 16 }}>
              Sign in to BAJAPRO
            </Title>
            <Text style={{ color: "#E5E7EB", fontSize: 16 }}>
              Platform belajar Java interaktif membantu kuasai logika pemrograman
              secara mendalam dan sistematis.
            </Text>
          </div>
        </div>

      </div>
    </>
  );
}