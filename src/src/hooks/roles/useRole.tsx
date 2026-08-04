import { useState, useEffect } from "react";
import { message } from "antd";
import { RoleData, RoleFormData } from "@/src/types/roles";
import {
  getRolesApi,
  getRoleByIdApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
} from "@/src/actions/roles/roleApi";

export const useRole = () => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage(); // Untuk pop-up notifikasi hijau/merah

  // Fungsi untuk mengambil semua data dan memasukkannya ke state 'badges'
  const fetchBadges = async () => {
    setLoading(true);
    try {
      const data = await getRolesApi();
      setRoles(data);
    } catch (error) {
      messageApi.error("Gagal memuat data role");
    } finally {
      setLoading(false);
    }
  };

  // Otomatis jalankan fetchBadges saat halaman pertama kali dibuka
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchRoleById = async (id: string | number) => {
    try {
      return await getRoleByIdApi(id);
    } catch (error) {
      messageApi.error("Gagal mengambil detail role");
      return null;
    }
  };

  const addRole = async (data: RoleFormData) => {
    setLoading(true);
    try {
      await createRoleApi(data);
      messageApi.success("Role berhasil ditambahkan!");
      fetchBadges(); // Refresh tabel setelah nambah data
      return true;
    } catch (error) {
      messageApi.error("Gagal menambahkan badge");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editRole = async (id: string | number, data: RoleFormData) => {
    setLoading(true);
    try {
      await updateRoleApi(id, data);
      messageApi.success("Role berhasil diperbarui!");
      fetchBadges(); // Refresh tabel setelah edit data
      return true;
    } catch (error) {
      messageApi.error("Gagal memperbarui role");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteRole = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteRoleApi(id);
      messageApi.success("Role berhasil dihapus!");
      fetchBadges(); // Refresh tabel setelah hapus data
      return true;
    } catch (error) {
      messageApi.error("Gagal menghapus role");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    loading,
    contextHolder, // Wajib dikembalikan untuk dipasang di HTML nanti
    fetchRoleById,
    addRole,
    editRole,
    deleteRole,
  };
};
