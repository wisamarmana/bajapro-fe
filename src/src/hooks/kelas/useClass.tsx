import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { ClassData, ClassFormData } from "@/src/types/kelas";
import { 
  getClassApi, 
  createClassApi, 
  updateClassApi, 
  deleteClassApi, 
  getGuruOptionsApi 
} from "@/src/actions/kelas/classApi";

export const useClass = () => {
  const [kelas, setKelas] = useState<ClassData[]>([]);
  const [guruOptions, setGuruOptions] = useState<{label: string, value: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchKelas = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClassApi();
      setKelas(Array.isArray(data) ? data : []);
    } catch (error) {
      messageApi.error("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  const fetchOptions = useCallback(async () => {
    try {
      const options = await getGuruOptionsApi();
      setGuruOptions(options);
    } catch (error) {
      console.error("Gagal memuat opsi guru", error);
    }
  }, []);

  useEffect(() => {
    fetchKelas();
    fetchOptions();
  }, [fetchKelas, fetchOptions]);

  const addKelas = async (values: ClassFormData) => {
    setLoading(true);
    try {
      await createClassApi(values);
      messageApi.success("Kelas berhasil ditambahkan!");
      await fetchKelas();
      return true;
    } catch (error) {
      messageApi.error("Gagal menambahkan kelas");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editKelas = async (id: string | number, values: ClassFormData) => {
    setLoading(true);
    try {
      await updateClassApi(id, values);
      messageApi.success("Kelas berhasil diupdate!");
      await fetchKelas();
      return true;
    } catch (error) {
      messageApi.error("Gagal mengupdate kelas");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteKelas = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteClassApi(id);
      messageApi.success("Kelas berhasil dihapus");
      await fetchKelas();
    } catch (error) {
      messageApi.error("Gagal menghapus kelas");
    } finally {
      setLoading(false);
    }
  };

  return { 
    kelas, 
    guruOptions, 
    loading, 
    addKelas, 
    editKelas, 
    deleteKelas, 
    contextHolder 
  };
};
