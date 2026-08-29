"use client";

import React, { useState } from "react";
import { Button, Typography, Result, Input, Card, message } from "antd";
import { useRouter } from "next/navigation";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function WaitingApprovalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'error', text: string } | null>(null);
  
  const [messageApi, contextHolder] = message.useMessage();

  const handleCheckStatus = async () => {
    if (!searchQuery.trim()) {
      messageApi.error("Silakan masukkan email Anda.");
      return;
    }
    
    setLoading(true);
    setStatusMessage(null);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      // Gunakan email karena email pasti unik
      const response = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(searchQuery)}&role_id=2`, { credentials: "include" });
      if (response.ok) {
        const users = await response.json();
        
        if (users && users.length > 0) {
          const user = users[0];
          if (user.is_approved_by_admin === 1) {
            setStatusMessage({ 
              type: 'success', 
              text: `Halo ${user.name}, akun Anda TELAH DISETUJUI! Silakan Login ke Dashboard.` 
            });
          } else {
            setStatusMessage({ 
              type: 'warning', 
              text: `Halo ${user.name}, akun Anda MASIH DALAM PENINJAUAN. Silakan tunggu atau hubungi Admin.` 
            });
          }
        } else {
          setStatusMessage({ 
            type: 'error', 
            text: "Data pengajar dengan email tersebut tidak ditemukan." 
          });
        }
      }
    } catch (err) {
      messageApi.error("Gagal mengecek status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5', padding: 20 }}>
      {contextHolder}
      <Card style={{ maxWidth: 500, width: "100%", borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <Result
          icon={<SearchOutlined style={{ color: "#5B21B6" }} />}
          title="Cek Status Persetujuan"
          subTitle="Masukkan email pendaftaran Anda untuk melihat apakah akun Pengajar Anda sudah disetujui oleh Admin."
        />
        
        <div style={{ padding: "0 24px 24px" }}>
          <Input 
            size="large"
            placeholder="Masukkan Email Anda" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleCheckStatus}
            style={{ marginBottom: 16 }}
          />
          
          <Button 
            type="primary" 
            size="large"
            block 
            onClick={handleCheckStatus} 
            loading={loading} 
            style={{ backgroundColor: "#5B21B6", marginBottom: 24 }}
          >
            Cek Status Sekarang
          </Button>

          {statusMessage && (
            <div style={{ 
              padding: 16, 
              borderRadius: 8, 
              backgroundColor: statusMessage.type === 'success' ? '#f6ffed' : statusMessage.type === 'warning' ? '#fffbe6' : '#fff2f0',
              border: `1px solid ${statusMessage.type === 'success' ? '#b7eb8f' : statusMessage.type === 'warning' ? '#ffe58f' : '#ffccc7'}`,
              marginBottom: 24,
              textAlign: "center"
            }}>
              <Text strong style={{ color: statusMessage.type === 'success' ? '#52c41a' : statusMessage.type === 'warning' ? '#faad14' : '#ff4d4f' }}>
                {statusMessage.text}
              </Text>
            </div>
          )}

          <Button 
            type="default" 
            block 
            onClick={async () => {
              try {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, { method: "POST", credentials: "include" });
              } catch (e) {}
              router.replace("/login");
            }}
          >
            Kembali ke Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
