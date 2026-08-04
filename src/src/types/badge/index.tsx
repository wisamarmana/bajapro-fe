export interface BadgeData {
  id: number;         // Wajib ada untuk penanda unik dari Database
  name: string;       // Nama badge (misal: "Pemula Hebat")
  image: string;      // Biasanya berisi link URL gambar dari backend
  minScore: number;   // Nilai minimal (misal: 0)
  maxScore: number;   // Nilai maksimal (misal: 100)
  isactive: string;   // Status "Aktif" atau "Nonaktif"
}

export interface BadgeFormData {
  name: string;
  image: string;      
  minScore: number;
  maxScore: number;
}