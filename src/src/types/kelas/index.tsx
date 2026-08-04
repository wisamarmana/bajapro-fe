export interface ClassData {
  id: number;
  class_name: string;
  teacher_id: string;
  school_name: string;
  class_code: string;
  isactive: number;
  teacher_name?: string;
}

export interface ClassFormData {
  class_name: string;
  school_name: string;
  class_code: string;
}