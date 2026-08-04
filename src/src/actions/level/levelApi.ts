import { LevelData, LevelFormData } from "@/src/types/level";

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

// --- DATA DUMMY (Abaikan saja, ini untuk sementara) ---
let dummyLevels: LevelData[] = [
  { id: 1, level_name: "Easy", deskripsi: "Materi dasar", isactive: "Active" },
  { id: 2, level_name: "Medium", deskripsi: "Materi lanjutan", isactive: "Active" },
  { id: 3, level_name: "Hard", deskripsi: "Materi sulit", isactive: "Nonactive" },
];


// 1. GET ALL
export const getLevelsApi = async (): Promise<LevelData[]> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels`, { credentials: "include" });
    if (!response.ok) throw new Error("Gagal mengambil data");
    return response.json();
  } else {
   
    return new Promise((resolve) => setTimeout(() => resolve([...dummyLevels]), 0));
  }
};

// 2. GET BY ID
export const getLevelByIdApi = async (id: string | number): Promise<LevelData> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`, { credentials: "include" });
    if (!response.ok) throw new Error("Gagal mengambil detail data");
    return response.json();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyLevels.find(item => item.id == id);
        resolve(found as LevelData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createLevelApi = async (data: LevelFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal menyimpan data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLevel: LevelData = {
          id: Math.random(),
          level_name: data.levelName,
          deskripsi: data.description,
          isactive: "Aktif"
        };
        dummyLevels.push(newLevel);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT/PATCH (EDIT)
export const updateLevelApi = async (id: string | number, data: LevelFormData): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal mengupdate data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyLevels = dummyLevels.map(item => 
          item.id == id ? { ...item, level: data.levelName, deskripsi: data.description } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteLevelApi = async (id: string | number): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/levels/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) throw new Error("Gagal menghapus data");
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyLevels = dummyLevels.filter(item => item.id != id);
        resolve();
      }, 0);
    });
  }
};
