export interface EssayFormData {
  id?: number;
  code_question_id?: number;
  question: string;
  answer: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
  isactive?: boolean;
}

export interface CodeFormData {
  id?: number;
  sub_lesson_id: number;
  code_question: string;
  score: number;
  isactive?: boolean;
  essays: EssayFormData[]; // Pasti berisi 3 elemen
}

export interface QuestionRecord extends CodeFormData {
  id: number;
  course_id?: number; // Untuk kebutuhan UI Filter
  lesson_id?: number; // Untuk kebutuhan UI Filter
  course_name?: string;
  sub_lesson_name?: string;
  code_question: string;
}