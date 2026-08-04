/*
  Warnings:

  - The primary key for the `code_question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `essay_question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `materials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `sublessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_code_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_code_history_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_essay_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_student_course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_student_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `t_wondering_score` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "code_question" DROP CONSTRAINT "code_question_sub_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "essay_question" DROP CONSTRAINT "essay_question_code_question_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_course_id_fkey";

-- DropForeignKey
ALTER TABLE "materials" DROP CONSTRAINT "materials_sub_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "sublessons" DROP CONSTRAINT "sublessons_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "t_code_answer" DROP CONSTRAINT "t_code_answer_code_question_id_fkey";

-- DropForeignKey
ALTER TABLE "t_code_answer" DROP CONSTRAINT "t_code_answer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_code_history_logs" DROP CONSTRAINT "t_code_history_logs_code_question_id_fkey";

-- DropForeignKey
ALTER TABLE "t_code_history_logs" DROP CONSTRAINT "t_code_history_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_essay_answer" DROP CONSTRAINT "t_essay_answer_essay_question_id_fkey";

-- DropForeignKey
ALTER TABLE "t_essay_answer" DROP CONSTRAINT "t_essay_answer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_student_course" DROP CONSTRAINT "t_student_course_course_id_fkey";

-- DropForeignKey
ALTER TABLE "t_student_course" DROP CONSTRAINT "t_student_course_student_id_fkey";

-- DropForeignKey
ALTER TABLE "t_student_progress" DROP CONSTRAINT "t_student_progress_course_id_fkey";

-- DropForeignKey
ALTER TABLE "t_student_progress" DROP CONSTRAINT "t_student_progress_sub_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "t_student_progress" DROP CONSTRAINT "t_student_progress_user_id_fkey";

-- DropForeignKey
ALTER TABLE "t_wondering_score" DROP CONSTRAINT "t_wondering_score_sub_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "t_wondering_score" DROP CONSTRAINT "t_wondering_score_user_id_fkey";

-- AlterTable
ALTER TABLE "class" ALTER COLUMN "teacher_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "code_question" DROP CONSTRAINT "code_question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_lesson_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "code_question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "code_question_id_seq";

-- AlterTable
ALTER TABLE "courses" DROP CONSTRAINT "courses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "courses_id_seq";

-- AlterTable
ALTER TABLE "essay_question" DROP CONSTRAINT "essay_question_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_lesson_id" SET DATA TYPE TEXT,
ALTER COLUMN "code_question_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "essay_question_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "essay_question_id_seq";

-- AlterTable
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "lessons_id_seq";

-- AlterTable
ALTER TABLE "materials" DROP CONSTRAINT "materials_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_lesson_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "materials_id_seq";

-- AlterTable
ALTER TABLE "sublessons" DROP CONSTRAINT "sublessons_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lesson_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "sublessons_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "sublessons_id_seq";

-- AlterTable
ALTER TABLE "t_code_answer" DROP CONSTRAINT "t_code_answer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "code_question_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_code_answer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_code_answer_id_seq";

-- AlterTable
ALTER TABLE "t_code_history_logs" DROP CONSTRAINT "t_code_history_logs_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "code_question_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_code_history_logs_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_code_history_logs_id_seq";

-- AlterTable
ALTER TABLE "t_essay_answer" DROP CONSTRAINT "t_essay_answer_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "essay_question_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_essay_answer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_essay_answer_id_seq";

-- AlterTable
ALTER TABLE "t_student_course" DROP CONSTRAINT "t_student_course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "student_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_student_course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_student_course_id_seq";

-- AlterTable
ALTER TABLE "t_student_progress" DROP CONSTRAINT "t_student_progress_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_lesson_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_student_progress_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_student_progress_id_seq";

-- AlterTable
ALTER TABLE "t_wondering_score" DROP CONSTRAINT "t_wondering_score_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "sub_lesson_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "t_wondering_score_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "t_wondering_score_id_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sublessons" ADD CONSTRAINT "sublessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_question" ADD CONSTRAINT "code_question_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay_question" ADD CONSTRAINT "essay_question_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_course" ADD CONSTRAINT "t_student_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_course" ADD CONSTRAINT "t_student_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wondering_score" ADD CONSTRAINT "t_wondering_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wondering_score" ADD CONSTRAINT "t_wondering_score_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_answer" ADD CONSTRAINT "t_code_answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_answer" ADD CONSTRAINT "t_code_answer_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_essay_answer" ADD CONSTRAINT "t_essay_answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_essay_answer" ADD CONSTRAINT "t_essay_answer_essay_question_id_fkey" FOREIGN KEY ("essay_question_id") REFERENCES "essay_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_history_logs" ADD CONSTRAINT "t_code_history_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_history_logs" ADD CONSTRAINT "t_code_history_logs_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
