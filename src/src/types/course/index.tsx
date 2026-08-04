// Interface DB m_course
export interface CourseRecord {
  id: number; // PK
  course_name: string;
  description: string ;
  img_thumbnail: string;
  published_?: boolean | null; 
  isactive: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface DB m_lesson
export interface LessonRecord {
  id: number; // PK
  course_id: number; // FK
  level_id: number;
  title: string;
  description: string | null;
  position: number;
  img_thumbnail: string | null;
  published_?: boolean | null;
  isactive: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface DB m_sub_lesson
export interface SubLessonRecord {
  id: number; // PK
  lesson_id: number; // FK
  title: string;
  order_position: number;
  isactive: boolean;
  created_at?: string;
  updated_at?: string;
}

// Interface DB m_materials
export interface MaterialRecord {
  id: number; // PK
  sub_lesson_id: number; // FK
  title: string;
  materials: string | null; // Teks content
  url_video: string | null;
  content_position: number;
  published_?: boolean | null;
  isactive: boolean;
}

// Input Types untuk Formulir
export type CourseFormData = Omit<CourseRecord, "id" | "isactive">;
export type LessonCreateData = Omit<LessonRecord, "id" | "isactive" | "position">;
export type SubLessonCreateData = Omit<SubLessonRecord, "id" | "isactive" | "order_position">;
export type MaterialsCreateData = Omit<MaterialRecord, "id" | "isactive" | "content_position" >

// Type untuk reordering (bulk update position)
export interface ReorderItem {
  id: number;
  newPosition: number;
}