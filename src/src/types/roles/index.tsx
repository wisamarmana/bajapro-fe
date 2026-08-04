export interface RoleData {
  id: number;         // Wajib ada untuk penanda unik dari Database
  role_name: string;       // Nama role
  isactive: string;   // Status "Aktif" atau "Nonaktif"
}

export interface RoleFormData {
  role_name: string;

}