import { RoleData, RoleFormData } from "@/src/types/roles";

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

let dummyRoles: RoleData[] = [
  { id: 1, role_name: "Admin", isactive: "Aktif" },
  { id: 2, role_name: "Pengajar", isactive: "Aktif" },
   { id: 3, role_name: "Pelajar", isactive: "Aktif" },
];

// 1. GET ALL
export const getRolesApi = async (): Promise<RoleData[]> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/roles`);
  } else {
    return new Promise((resolve) => setTimeout(() => resolve([...dummyRoles]), 0));
  }
};

// 2. GET BY ID
export const getRoleByIdApi = async (id: string | number): Promise<RoleData> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/roles/${id}`);
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const found = dummyRoles.find(item => item.id == id);
        resolve(found as RoleData);
      }, 0);
    });
  }
};

// 3. POST (TAMBAH)
export const createRoleApi = async (data: RoleFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRole: RoleData = {
          id: Math.random(),
          role_name: data.role_name,
          isactive: "Aktif"
        };
        dummyRoles.push(newRole);
        resolve();
      }, 0);
    });
  }
};

// 4. PUT (EDIT)
export const updateRoleApi = async (id: string | number, data: RoleFormData): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/roles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyRoles = dummyRoles.map(item => 
          item.id === id ? { 
            ...item, 
            role_name: data.role_name 
          } : item
        );
        resolve();
      }, 0);
    });
  }
};

// 5. DELETE (HAPUS)
export const deleteRoleApi = async (id: string | number): Promise<void> => {
  if (USE_REAL_API) {
    await handleFetch(`${BASE_URL}/roles/${id}`, {
      method: "DELETE",
    });
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        dummyRoles = dummyRoles.filter(item => item.id != id);
        resolve();
      }, 0);
    });
  }
};
