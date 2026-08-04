import { BadgeData, BadgeFormData } from "@/src/types/badge";

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
        let errorMsg = response.statusText;
        try {
          const errorJson = await response.json();
          errorMsg = errorJson.error || errorMsg;
        } catch (e) {}
        console.error(`Fetch Error: ${response.status} - ${errorMsg} pada URL: ${url}`);
        throw new Error(`Server Error (${response.status}): ${errorMsg}`);
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

let dummyBadges: BadgeData[] = [
  { id: 1, name: "Pemula Hebat", image: "/assets/gamification/lv 1.png", minScore: 0, maxScore: 50, isactive: "Aktif" },
  { id: 2, name: "Si Jagoan", image: "/assets/gamification/lv 2.png", minScore: 51, maxScore: 100, isactive: "Aktif" },
];

// 1. GET ALL
export const getBadgesApi = async (): Promise<BadgeData[]> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/badges`);
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyBadges]), 0));
  }
};

// 2. GET BY ID
export const getBadgeByIdApi = async (id: string | number): Promise<BadgeData> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/badges/${id}`);
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyBadges.find(item => item.id == id);
        resolve(found as BadgeData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createBadgeApi = async (data: BadgeFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/badges`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newBadge: BadgeData = {
          id: Math.random(),
          name: data.name,
          image: data.image || "https://via.placeholder.com/50",
          minScore: data.minScore,
          maxScore: data.maxScore,
          isactive: "Aktif"
        };
        dummyBadges.push(newBadge);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT (EDIT)
export const updateBadgeApi = async (id: string | number, data: BadgeFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/badges/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyBadges = dummyBadges.map(item => 
          item.id === id ? { 
            ...item, 
            name: data.name, 
            image: data.image, 
            minScore: data.minScore, 
            maxScore: data.maxScore 
          } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteBadgeApi = async (id: string | number): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/badges/${id}`, {
      method: "DELETE",
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyBadges = dummyBadges.filter(item => item.id != id);
        resolve();
      }, 0);
    });
  }
};