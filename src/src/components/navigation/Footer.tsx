"use client";

import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

const Footer: React.FC = () => {
  // Ambil tahun secara otomatis agar tidak perlu update manual tiap tahun
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: 'center', // Teks di tengah
        background: '#ffffff', // Putih bersih sama dengan Navbar
        padding: '20px 0', // Jarak atas-bawah
        borderTop: '1px solid #f0f0f0', // Garis tipis di atas footer
      }}
    >
      <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
        {currentYear} © <span style={{ color: '#531DAB', fontWeight: 600 }}>BAJAPRO</span>. 
        All Rights Reserved.
      </Text>
    </AntFooter>
  );
};

export default Footer;