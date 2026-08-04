import { ClassData, ClassFormData } from "@/src/types/kelas";

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

// DUMMY DATA YANG SUDAH DISESUAIKAN
let dummyKelas: ClassData[] = [
  { id: 1, class_name: "10 IPA 1", class_code: "IPA1-X8Z", school_name: "SMAN 1 Malang", teacher_id: "p1", teacher_name: "Budi Santoso", isactive: 1 },
  { id: 2, class_name: "11 IPS 2", class_code: "IPS2-M9Q", school_name: "SMAN 1 Malang", teacher_id: "p1", teacher_name: "Budi Santoso", isactive: 1 },
  { id: 3, class_name: "12 Bahasa", class_code: "BHS-K2L", school_name: "Polinema", teacher_id: "p2", teacher_name: "Siti Aminah", isactive: 1 },
];

export const getClassApi= async (): Promise<ClassData[]> => {
  if (USE_REAL_API) {
    const classes = await handleFetch(`${BASE_URL}/class`);
    const users = await handleFetch(`${BASE_URL}/users`);
    return classes.map((c: any) => {
      const teacher = users.find((u: any) => Number(u.id) === Number(c.teacher_id));
      return {
        ...c,
        teacher_name: teacher ? teacher.name : "Belum diatur"
      };
    });
  }
  return new Promise((resolve) => setTimeout(() => resolve([...dummyKelas]), 500));
};

export const createClassApi= async (data: ClassFormData): Promise<ClassData> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/class`, {
      method: "POST", body: JSON.stringify(data),
    });
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const newKelas: ClassData = {
        ...data,
        id: Math.random(),
        teacher_id: "p1", // Simulasi user (Pengajar) yang sedang login
        teacher_name: "Budi Santoso",
        isactive: 1,
      };
      dummyKelas.push(newKelas);
      resolve(newKelas);
    }, 500);
  });
};

export const updateClassApi= async (id: string | number, data: ClassFormData): Promise<ClassData> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/class/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = dummyKelas.findIndex((k) => k.id == id);
      if (index !== -1) dummyKelas[index] = { ...dummyKelas[index], ...data };
      resolve(dummyKelas[index]);
    }, 500);
  });
};

export const deleteClassApi= async (id: string | number): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/class/${id}`, { method: "DELETE" });
    return;
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      dummyKelas = dummyKelas.filter((k) => k.id != id);
      resolve();
    }, 500);
  });
};

// Opsional: Untuk filter nama guru bagi Admin
export const getGuruOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) {
    const users = await handleFetch(`${BASE_URL}/users?role_id=2`);
    return users.map((u: any) => ({ label: u.name, value: u.name }));
  }
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { label: "Budi Santoso", value: "Budi Santoso" },
      { label: "Siti Aminah", value: "Siti Aminah" },
    ]), 300);
  });
};

export const getInstansiOptionsApi = async (): Promise<{ label: string; value: string }[]> => {
  if (USE_REAL_API) return handleFetch(`${BASE_URL}/instansi-options`);
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { label: "SMAN 1 Malang", value: "SMAN 1 Malang" },
      { label: "Polinema", value: "Polinema" },
    ]), 300);
  });
};
