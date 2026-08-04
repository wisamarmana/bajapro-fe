export type ID = string | number;

export interface ClassRecord { id: ID; class_name: string; teacher_id: ID; }
export interface CourseRecord { id: ID; course_name: string; }
export interface UserRecord { id: ID; name: string; class_id: ID;}

export interface StudentProgress {
  id: ID;
  user_id: ID;
  sub_lesson_id: ID;
  status: string ;
}

export interface StudentCourse {
  id: ID;
  user_id: ID;
  course_id: ID;
  total_score: number;
  badge_id: ID;
}

export interface EssayAnswer {
  id: ID;
  user_id: ID;
  essay_question_id: ID;
  answer: string;
  konteks_penjelasan: number;
  keruntutan: number;
  kebenaran: number;
  teacher_notes: string;
  is_approved_by_teacher: string;
}

 export interface CodeAnswer {
    id: ID;
    user_id: ID;
    code_question_id: ID;
    is_code_right: boolean;
    exploring_score: number;
 }