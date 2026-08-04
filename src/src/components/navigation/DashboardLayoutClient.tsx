"use client";

import React, { useState, Suspense } from "react";
import Sidebar from "@/src/components/navigation/Sidebar";
import Navbar from "@/src/components/navigation/Navbar";
import Footer from "@/src/components/navigation/Footer";
import { Drawer, Grid, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const screens = useBreakpoint();
  const isMobile = screens.md === false; 

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#F9FAFB]">
      
      {!isMobile && <Sidebar />}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center bg-white z-10 border-b border-gray-200">
          {isMobile && (
            <div className="pl-4">
              <Button 
                type="text" 
                icon={<MenuOutlined />} 
                onClick={() => setIsMobileMenuOpen(true)} 
                style={{ fontSize: "20px" }}
              />
            </div>
          )}
          <div className="flex-1">
            <Navbar />
          </div>
        </div>

        {/* KONTEN UTAMA */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <main className="flex-1 p-2 md:p-2">
            <Suspense fallback={<div className="p-4">Loading...</div>}>
              <div className="h-full">
                {children}
              </div>
            </Suspense>
          </main>
          <Footer />
        </div>
      </div>

      <Drawer
        title="Menu Navigasi"
        placement="left"
        closable={true}
        onClose={() => setIsMobileMenuOpen(false)}
        open={isMobileMenuOpen}
        size={260} 
        styles={{ body: { padding: 0 } }}
      >
        <div onClick={() => setIsMobileMenuOpen(false)}>
          <Sidebar />
        </div>
      </Drawer>

    </div>
  );
}
