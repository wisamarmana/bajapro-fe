import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import { Poppins } from "next/font/google";
import "./globals.css";
import { App } from 'antd';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], 
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "BAJAPRO",
  description: "Platform Belajar Masa Kini",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${poppins.className} antialiased`}>
        <AntdRegistry>
          <ConfigProvider theme={{ token: { colorPrimary: '#531DAB', fontFamily: poppins.style.fontFamily || 'sans-serif' } }}>
            <App>
            {children}
            </App>
            {process.env.NODE_ENV === 'development' && (
              <Script src="/figma-capture.js" strategy="afterInteractive" />
            )}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
