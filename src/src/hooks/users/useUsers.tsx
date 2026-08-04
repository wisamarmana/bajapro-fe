import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { UserData, UserFormData } from "@/src/types/users";
import { 
  getUsersApi, 
  createUserApi, 
  updateUserApi, 
  deleteUserApi,
  getInstansiOptionsApi, 
  getKelasOptionsApi, 
  getRoleOptionsApi 
} from "@/src/actions/users/usersApi";

interface SessionUser {
  id?: number | string;
  role_id?: number | string;
}

export const useUser = (sessionUser?: SessionUser | null) => {
  // State untuk data tabel
  const [users, setUsers] = useState<UserData[]>([]);
  
  // State untuk data dropdown (filter & form)
  const [instansiOptions, setInstansiOptions] = useState<{label: string, value: string}[]>([]);
  const [kelasOptions, setKelasOptions] = useState<{label: string, value: string}[]>([]);
  const [roleOptions, setRoleOptions] = useState<{label: string, value: string}[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // 1. Fungsi khusus untuk mengambil data User (tabel)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const isPengajar = Number(sessionUser?.role_id) === 2;
      const teacherId = isPengajar ? Number(sessionUser?.id) : null;
      
      const data = await getUsersApi(teacherId);
      setUsers(data);
    } catch (error) {
      messageApi.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  // 2. Fungsi khusus untuk mengambil opsi Filter & Form
  const fetchOptions = useCallback(async () => {
    try {
      // Kalau yang login adalah Pengajar (role_id=2), kirim ID-nya agar kelas difilter
      const isPengajar = Number(sessionUser?.role_id) === 2;
      const teacherId = isPengajar ? Number(sessionUser?.id) : null;

      const [instansiData, kelasData, roleData] = await Promise.all([
        getInstansiOptionsApi(),
        getKelasOptionsApi(teacherId),
        getRoleOptionsApi()
      ]);
      setInstansiOptions(instansiData);
      setKelasOptions(kelasData);
      setRoleOptions(roleData);
    } catch (error) {
      console.error("Gagal memuat data opsi dropdown", error);
    }
  }, [sessionUser?.id, sessionUser?.role_id]);

  // 3. Panggil kedua fungsi di atas SAAT HALAMAN PERTAMA KALI DIBUKA
  useEffect(() => {
    fetchUsers();
    fetchOptions();
  }, [fetchUsers, fetchOptions]);

  // --- FUNGSI CRUD BAWAAN ---
  const addUser = async (values: UserFormData) => {
    setLoading(true);
    try {
      await createUserApi(values);
      messageApi.success("User berhasil ditambahkan!");
      await fetchUsers(); // Refresh tabel setelah nambah
      return true;
    } catch (error) {
      messageApi.error("Gagal menambahkan user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const editUser = async (id: string | number, values: UserFormData) => {
    setLoading(true);
    try {
      await updateUserApi(id, values);
      messageApi.success("User berhasil diupdate!");
      await fetchUsers(); // Refresh tabel setelah edit
      return true;
    } catch (error) {
      messageApi.error("Gagal mengupdate user");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string | number) => {
    setLoading(true);
    try {
      await deleteUserApi(id);
      messageApi.success("User berhasil dihapus");
      await fetchUsers(); // Refresh tabel setelah hapus
    } catch (error) {
      messageApi.error("Gagal menghapus user");
    } finally {
      setLoading(false);
    }
  };

  return { 
    users, 
    instansiOptions, 
    kelasOptions, 
    roleOptions, 
    loading, 
    addUser, 
    editUser, 
    deleteUser, 
    contextHolder 
  };
};

