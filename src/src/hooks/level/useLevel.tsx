import { useState, useEffect } from "react";
import { getLevelsApi, createLevelApi, updateLevelApi, getLevelByIdApi, deleteLevelApi } from "@/src/actions/level/levelApi";
import { LevelData, LevelFormData } from "@/src/types/level";
import { message } from "antd";

export const useLevel = () => {
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // 1. Ambil List Data
  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await getLevelsApi();
      setLevels(data);
    } catch (error) {
      messageApi.error("Gagal mengambil data level");
    } finally {
      setLoading(false);
    }
  };

  // 2. Tambah Data
  const addLevel = async (values: LevelFormData) => {
    setLoading(true);
    try {
      await createLevelApi(values);
      messageApi.success("Level berhasil ditambahkan!");
      await fetchLevels(); // Otomatis refresh tabel setelah simpan!
      return true; // Beri sinyal sukses untuk menutup Modal
    } catch (error) {
      messageApi.error("Gagal menyimpan data");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 3. Edit Data
  const editLevel = async (id: string | number, values: LevelFormData) => {
    setLoading(true);
    try {
      await updateLevelApi(id, values);
      messageApi.success("Level berhasil diperbarui!");
      await fetchLevels(); // Otomatis refresh tabel!
      return true;
    } catch (error) {
      messageApi.error("Gagal memperbarui data");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. Ambil 1 Detail (Untuk ditaruh di form)
  const fetchLevelById = async (id: string | number) => {
    setLoading(true);
    try {
      return await getLevelByIdApi(id); // Langsung lempar datanya
    } catch (error) {
      messageApi.error("Gagal mengambil detail level");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteLevel = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteLevelApi(id);
      messageApi.success("Level berhasil dihapus!");
      await fetchLevels(); // Refresh tabel setelah dihapus
    } catch (error) {
      messageApi.error("Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchLevels();
  }, []);

  return { levels, loading, addLevel, editLevel, fetchLevelById, contextHolder, deleteLevel };
};
