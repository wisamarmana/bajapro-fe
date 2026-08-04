import {Permission } from "@/src/types/permission";
import {RoleData} from "@/src/types/roles"

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
  const response = await fetch(url, { ...options, credentials: "include" });
  if (!response.ok) throw new Error("Gagal mengambil data dari server");
  return response.json();
};

export const fetchRolesApi = async (): Promise<RoleData[]> => {
  if (USE_REAL_API) return handleFetch(`${BASE_URL}/roles`);
  return [];
};

export const fetchAllPermissionsApi = async (): Promise<Permission[]> => {
  // Ini akan mengambil [{ id: 1, name: "course.read", role_ids: [1, 2] }] dari Postman temanmu
  if (USE_REAL_API) return handleFetch(`${BASE_URL}/permissions?t=${Date.now()}`);
  return [];
};

export const updateRolePermissionsApi = async (roleId: number, permissionIds: number[]): Promise<void> => {
  
  const response = await fetch(`${BASE_URL}/permissions?t=${Date.now()}`, { credentials: "include" });
  const allPermissions: Permission[] = await response.json();

  const safeRoleId = Number(roleId);

  const updatePromises = allPermissions.map((perm) => {
    let currentRoleIds = (perm.role_ids || []).map(id => Number(id));
    const targetRoleId = Number(roleId);
    
    const isCheckedDiLayar = permissionIds.includes(perm.id);
    const hasRoleDiDatabase = currentRoleIds.includes(targetRoleId);

    let needsUpdate = false;

    if (isCheckedDiLayar && !hasRoleDiDatabase) {
      currentRoleIds.push(targetRoleId);
      needsUpdate = true;
    } 
    else if (!isCheckedDiLayar && hasRoleDiDatabase) {
      currentRoleIds = currentRoleIds.filter(id => id !== targetRoleId);
      needsUpdate = true;
    }
    if (needsUpdate) {
      return fetch(`${BASE_URL}/permissions/${perm.id}`, {
        method: "PATCH", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role_ids: currentRoleIds }),
      });
    }

    return Promise.resolve(); // Kalau tidak ada perubahan, skip
  });

  // 4. Tunggu semua proses update selesai
  await Promise.all(updatePromises);
};
