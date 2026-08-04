export interface UserData {
  id: number;
  name: string;
  role: string;
  email: string;
  nip?: string; // Opsional (hanya Pengajar)
  isactive: number; // 1 untuk aktif, 0 untuk nonaktif
  instansi_sekolah?: string;
  class_name?: string;
}

export interface UserFormData {
  name: string;
  role: string;
  email: string;
  nip?: string; // Opsional (hanya Pengajar)
  password?: string; // Opsional saat edit
  instansi_sekolah?: string; // Opsional (hanya Pengajar)
  class_name?: string;    // Opsional (hanya Pelajar)
}