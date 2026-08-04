import { useState, useEffect, useMemo } from "react";
import { message } from "antd";
import { Permission, PermissionRow } from "@/src/types/permission";
import {RoleData} from "@/src/types/roles"

import { 
  fetchRolesApi, 
  fetchAllPermissionsApi, 
  updateRolePermissionsApi 
} from "@/src/actions/permission/permissionApi";

export const FEATURES = [
  "Course", "Level", "Question", 
  "Users", "Roles", "Kelas", "Approval", "Permission",
  "Report", "Leaderboard", "Badge"
];
export const ACTIONS = ["create", "read", "update", "delete", "active"];

export const usePermission = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(false);
  
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [activePermissionIds, setActivePermissionIds] = useState<number[]>([]);

  // 1. Fetch Master Data sekali saja saat awal load
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [rolesResponse, permsResponse] = await Promise.all([
          fetchRolesApi(),
          fetchAllPermissionsApi()
        ]);

        const rolesData = Array.isArray(rolesResponse) ? rolesResponse : (rolesResponse as { data?: RoleData[] })?.data || [];
        const permsData = Array.isArray(permsResponse) ? permsResponse : (permsResponse as { data?: Permission[] })?.data || [];

        setRoles(rolesData);
        setAllPermissions(permsData);
        
        // Pilih Role Pertama OTOMATIS sekaligus hitung centangnya (Tanpa useEffect tambahan)
        if (rolesData.length > 0) {
          const firstRole = rolesData[0];
          setSelectedRole(firstRole);

          const activeIds = permsData
  .filter((perm) => perm.role_ids && perm.role_ids.map(Number).includes(Number(firstRole.id)))
  .map((perm) => perm.id);

          setActivePermissionIds(activeIds);
        }

      } catch (error) {
        messageApi.error("Gagal mengambil data dari API");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [messageApi]);

  // 2. FUNGSI BARU PENGGANTI useEffect (Hanya jalan saat tombol diklik!)
  const handleSelectRole = (role: RoleData) => {
    setSelectedRole(role); // Set role terpilih
    
    // Langsung hitung centang untuk role ini dan pasang ke state
    const activeIds = allPermissions
  .filter((perm) => perm.role_ids && perm.role_ids.map(Number).includes(Number(role.id)))
  .map((perm) => perm.id);
      
    setActivePermissionIds(activeIds);
  };

  // 3. Olah data untuk baris tabel
  const tableDataSource = useMemo(() => {
    return FEATURES.map((feat) => {
      const row: Record<string, string | number> = { feature: feat, key: feat };
      ACTIONS.forEach((act) => {
        const targetName = `${feat.toLowerCase()}.${act}`;
        const found = allPermissions.find(p => p.name === targetName);
        if (found) row[act] = found.id;
      });
      return row as unknown as PermissionRow; 
    });
  }, [allPermissions]);

  // 4. Centang / Uncentang di layar sementara & Auto-save
  const handleToggle = async (permId: number, checked: boolean) => {
    if (!selectedRole) return;
    
    const newActiveIds = checked 
      ? [...activePermissionIds, permId] 
      : activePermissionIds.filter(id => id !== permId);
      
    setActivePermissionIds(newActiveIds);
    setLoading(true);
    
    try {
      await updateRolePermissionsApi(selectedRole.id, newActiveIds);
      messageApi.success(`Akses fitur diperbarui!`);
      
      // Update state allPermissions agar kalau pindah role tidak perlu refresh browser
      const updatedPerms = await fetchAllPermissionsApi();
      const permsData = Array.isArray(updatedPerms) ? updatedPerms : (updatedPerms as { data?: Permission[] })?.data || [];
      setAllPermissions(permsData);

      // Broadcast ke seluruh komponen yg pakai useAuth agar langsung re-fetch
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permission-updated'));
      }

    } catch (error) {
      messageApi.error("Gagal menyimpan perubahan");
      // Revert on error
      setActivePermissionIds(activePermissionIds);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {}; // Dummy to not break exports if used elsewhere

  return {
    loading, roles, selectedRole, tableDataSource, activePermissionIds, 
    handleSelectRole, 
    handleToggle, handleSave, contextHolder
  };
};
