import { TeacherRecord } from "@/src/types/approval";
import React from "react";

// Ambil alamat URL dari file .env.local
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "/api";
  if (typeof window === "undefined" && url.startsWith("/")) {
    if (process.env.VERCEL_URL) {
      url = "https://" + process.env.VERCEL_URL + url;
    } else {
      const port = process.env.PORT || 3000;
      url = `http://localhost:${port}${url}`;
    }
  }
  return url;
};
const BASE_URL = getBaseUrl();

const USE_REAL_API = true; 

const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    try {
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || ""; 
      }

      const customOptions: RequestInit = {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options?.headers || {}), 
        },
      };

      const response = await fetch(url, customOptions);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.warn("Akses ditolak atau sesi kedaluwarsa. Redirecting ke login...");
        }
        console.error(`Fetch Error: ${response.status} - ${response.statusText} pada URL: ${url}`);
        throw new Error(`Server Error (${response.status}): ${response.statusText}`);
      }
      
      return response.json();
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

// Gunakan let agar data dummy bisa diubah saat simulasi
let dummyData: TeacherRecord[] = [
  { key: "1", no: 1, nama: "Yolanda Ekaputri Setyawan", email: "yolandaeka47@gmail.com", instansi: "Politeknik Negeri Malang", nip: "199001012019032011", is_approved_by_admin: 1 },
  { key: "2", no: 2, nama: "Fida Cahya", email: "fida@gmail.com", instansi: "SMK 6 Malang", nip: "198505122010012005", is_approved_by_admin: 2 },
  { key: "3", no: 3, nama: "Yovi Dwicho Setyawan", email: "yovi@gmail.com", instansi: "SMK 7 MALANG", nip: "199208172020121008", is_approved_by_admin: 0 },
  { key: "4", no: 4, nama: "Karvin", email: "karvin@gmail.com", instansi: "SMKN 8 MALANG", nip: "198811222015041002", is_approved_by_admin: 0 },
];

// 1. GET ALL (Ambil List Pengajar)
export const fetchPengajarApi = async (): Promise<TeacherRecord[]> => {
  if (USE_REAL_API) {
    const isJsonServer = BASE_URL.includes("3001");
    const endpoint = isJsonServer ? "/users?role_id=2" : "/admin/approval-pengajar";
    const data = await handleFetch(`${BASE_URL}${endpoint}`);
    
    if (isJsonServer) {
      return data.map((u: any, index: number) => ({
        key: u.id,
        no: index + 1,
        nama: u.name,
        email: u.email,
        instansi: u.instansi_sekolah || "-",
        nip: u.nip || "-",
        is_approved_by_admin: u.is_approved_by_admin ?? 0,
      }));
    }
    return data;
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyData]), 500)); // Simulasi loading 0.5s
  }
};

// 2. POST / PUT (APPROVE PENGAJAR)
export const approvePengajarApi = async (keys: React.Key[]): Promise<void> => {
  if (USE_REAL_API) {
    if (BASE_URL.includes("3001")) {
      await Promise.all(keys.map(key => 
        handleFetch(`${BASE_URL}/users/${String(key)}`, {
          method: "PATCH",
          body: JSON.stringify({ is_approved_by_admin: 1 })
        })
      ));
    } else {
      await handleFetch(`${BASE_URL}/admin/approval-pengajar/approve`, {
        method: "POST", 
        body: JSON.stringify({ keys }),
      });
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyData = dummyData.map((item) =>
          keys.includes(item.key) ? { ...item, is_approved_by_admin: 1 } : item
        );
        resolve();
      }, 300);
    });
  }
};

// 3. POST / PUT (REJECT PENGAJAR)
export const rejectPengajarApi = async (keys: React.Key[]): Promise<void> => {
  if (USE_REAL_API) {
    if (BASE_URL.includes("3001")) {
      await Promise.all(keys.map(key => 
        handleFetch(`${BASE_URL}/users/${String(key)}`, {
          method: "PATCH",
          body: JSON.stringify({ is_approved_by_admin: 2 })
        })
      ));
    } else {
      await handleFetch(`${BASE_URL}/admin/approval-pengajar/reject`, {
        method: "POST", 
        body: JSON.stringify({ keys }), 
      });
    }
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyData = dummyData.map((item) =>
          keys.includes(item.key) ? { ...item, is_approved_by_admin: 2 } : item
        );
        resolve();
      }, 300);
    });
  }
};
