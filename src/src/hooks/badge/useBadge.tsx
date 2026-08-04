import { useState, useEffect } from "react";
import { message } from "antd";
import { BadgeData, BadgeFormData } from "@/src/types/badge";
import {
  getBadgesApi,
  getBadgeByIdApi,
  createBadgeApi,
  updateBadgeApi,
  deleteBadgeApi,
} from "@/src/actions/badge/badgeApi";

export const useBadge = () => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage(); // Untuk pop-up notifikasi hijau/merah

  // Fungsi untuk mengambil semua data dan memasukkannya ke state 'badges'
  const fetchBadges = async () => {
    setLoading(true);
    try {
      const data = await getBadgesApi();
      setBadges(data);
    } catch (error) {
      messageApi.error("Gagal memuat data badge");
    } finally {
      setLoading(false);
    }
  };

  // Otomatis jalankan fetchBadges saat halaman pertama kali dibuka
  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadgeById = async (id: string | number) => {
    try {
      return await getBadgeByIdApi(id);
    } catch (error) {
      messageApi.error("Gagal mengambil detail badge");
      return null;
    }
  };

  const addBadge = async (data: BadgeFormData) => {
    setLoading(true);
    try {
      await createBadgeApi(data);
      messageApi.success("Badge berhasil ditambahkan!");
      fetchBadges(); // Refresh tabel setelah nambah data
      return true;
    } catch (error) {
      messageApi.error("Gagal menambahkan badge");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editBadge = async (id: string | number, data: BadgeFormData) => {
    setLoading(true);
    try {
      await updateBadgeApi(id, data);
      messageApi.success("Badge berhasil diperbarui!");
      fetchBadges(); // Refresh tabel setelah edit data
      return true;
    } catch (error) {
      messageApi.error("Gagal memperbarui badge");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteBadge = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteBadgeApi(id);
      messageApi.success("Badge berhasil dihapus!");
      fetchBadges(); // Refresh tabel setelah hapus data
      return true;
    } catch (error) {
      messageApi.error("Gagal menghapus badge");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    badges,
    loading,
    contextHolder, // Wajib dikembalikan untuk dipasang di HTML nanti
    fetchBadgeById,
    addBadge,
    editBadge,
    deleteBadge,
  };
};