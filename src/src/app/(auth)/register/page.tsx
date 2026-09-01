"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, Segmented, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const { Title, Text } = Typography;

interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  kode_kelas?: string;    
  nip?: string;           
  asal_instansi?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"Student" | "Teacher">("Student");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRegister = async (values: RegisterValues) => {
    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      
      const newUser = {
        role_id: role === "Student" ? 3 : 2,
        class_id: null,
        kode_kelas: values.kode_kelas && values.kode_kelas.trim() !== "" ? values.kode_kelas.trim() : null,
        name: values.name,
        email: values.email,
        password: values.password,
        nip: role === "Student" ? null : values.nip,
        instansi_sekolah: role === "Student" ? "" : values.asal_instansi,
        isactive: true,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0],
      };

      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const createdUser = await res.json();
        document.cookie = `user=${encodeURIComponent(JSON.stringify(createdUser))}; path=/`;

        if (role === "Student") {
          messageApi.success("Registrasi Siswa Berhasil!");
          router.push("/student/dashboard"); 
        } else {
          if (true) {
            messageApi.success("Registrasi Pengajar Berhasil! Menunggu Persetujuan.");
            router.push("/waiting-approval"); 
          } else {
            messageApi.success("Registrasi Pengajar Berhasil! Langsung masuk.");
            router.push("/dashboard"); // Langsung ke dashboard
          }
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData && errData.error) {
          messageApi.error(errData.error);
        } else {
          messageApi.error("Gagal mendaftar. Silakan coba lagi.");
        }
      }
    } catch (err) {
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

        .input-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .input-col {
          flex: 1 1 200px;
        }

        /* MEDIA QUERIES UNTUK RESPONSIVE */
        @media (max-width: 992px) {
          .banner-side {
            display: none; 
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
        
        {/* BAGIAN KIRI: BANNER UNGU */}
        <div className="banner-side">
          <div style={{ width: 400, height: 300, backgroundColor: "#ffffff20", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40 }}>
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
            <Title level={2} style={{ color: "white", marginBottom: 16 }}>Sign up to BAJAPRO</Title>
            <Text style={{ color: "#E5E7EB", fontSize: 16 }}>
              Mulai langkahmu memahami dasar pemrograman Java.
            </Text>
          </div>
        </div>

        {/* BAGIAN KANAN: FORM */}
        <div className="form-side">
          <div className="form-content" style={{ maxWidth: 480, width: "100%" }}>
            
            <Segmented
              options={["Student", "Teacher"]}
              value={role}
              onChange={(value) => {
                setRole(value as "Student" | "Teacher");
                form.resetFields();
              }}
              style={{ marginBottom: 24, padding: 4, backgroundColor: "#ede9fe", borderRadius: 30, border: "none" }}
            />

            <Title level={2} style={{ marginBottom: 8 }}>Sign up</Title>
            <Text type="secondary" style={{ display: "block", marginBottom: 32 }}>
              Lets get you all set up so you can access your personal account.
            </Text>

            <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false}>
              
              <div className="input-row">
                <Form.Item label="Name" name="name" className="input-col" rules={[{ required: true, message: "Wajib diisi" }]}>
                  <Input size="large" placeholder="ex. Budi Santoso" />
                </Form.Item>
                <Form.Item label="Email" name="email" className="input-col" rules={[{ required: true, message: "Wajib diisi" }, { type: "email", message: "Email tidak valid" }]}>
                  <Input size="large" placeholder="ex. budi@gmail.com" />
                </Form.Item>
              </div>

              {role === "Student" ? (
                <Form.Item label="Kode Kelas (Opsional)" name="kode_kelas" rules={[{ required: false }]}>
                  <Input size="large" placeholder="Masukkan kode kelas dari pengajar (kosongkan jika tidak ada)" />
                </Form.Item>
              ) : (
                <div className="input-row">
                  <Form.Item label="NIP" name="nip" className="input-col" rules={[{ required: true, message: "NIP wajib diisi" }]}>
                    <Input size="large" placeholder="Nomor Induk Pegawai" />
                  </Form.Item>
                  <Form.Item label="Asal Instansi" name="asal_instansi" className="input-col" rules={[{ required: true, message: "Asal Instansi wajib diisi" }]}>
                    <Input size="large" placeholder="Nama Sekolah/Kampus" />
                  </Form.Item>
                </div>
              )}

              <Form.Item label="Password" name="password" rules={[{ required: true, message: "Password wajib diisi" }]}>
                <Input.Password size="large" placeholder="••••••••••••••••" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
              </Form.Item>

              <Form.Item label="Confirm Password" name="confirm_password" dependencies={['password']} rules={[
                  { required: true, message: "Konfirmasi password wajib diisi" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error("Password tidak sama!"));
                    },
                  }),
                ]}>
                <Input.Password size="large" placeholder="••••••••••••••••" iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ background: "linear-gradient(90deg, #5B21B6 0%, #7C3AED 100%)", marginTop: 8, border: "none", borderRadius: 8 }}>
                Register
              </Button>
            </Form>

            <div style={{ textAlign: "center", marginTop: 24 }}>
              <Text>Already have an account? <Link href="/login" style={{ color: "#EF4444" }}>Login</Link></Text>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}