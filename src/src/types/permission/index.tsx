export interface Permission {
  id: number;
  name: string; // Isinya: "course.create", "user.read", dll
  role_ids: number[];
}

// Ini tipe untuk baris di tabel UI
export interface PermissionRow {
  feature: string; // "Course", "Users", dll
  create?: number; // ID permission-nya
  read?: number;
  update?: number;
  delete?: number;
}