// 1. Tipe data untuk membaca list level di Tabel & dari API
export interface LevelData {
  id: number;
  level_name: string;
  deskripsi: string;
  isactive: string; // Bisa diganti 'boolean' (true/false) kalau dari backend maunya begitu
}

// 2. Tipe data untuk inputan Form (Tambah & Edit)
export interface LevelFormData {
  levelName: string;
  description: string;
}