/*
  Warnings:

  - The primary key for the `class` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `class` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `teacher_id` column on the `class` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `code_question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `code_question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `essay_question` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `essay_question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `sub_lesson_id` column on the `essay_question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `code_question_id` column on the `essay_question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `lessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `materials` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `materials` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `sublessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `sublessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_code_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_code_answer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_code_history_logs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_code_history_logs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_essay_answer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_essay_answer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_student_course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_student_course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_student_progress` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_student_progress` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `t_wondering_score` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `t_wondering_score` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `class_id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `sub_lesson_id` on the `code_question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `course_id` on the `lessons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sub_lesson_id` on the `materials` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lesson_id` on the `sublessons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `t_code_answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `code_question_id` on the `t_code_answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `t_code_history_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `code_question_id` on the `t_code_history_logs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `t_essay_answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `essay_question_id` on the `t_essay_answer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `student_id` on the `t_student_course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `course_id` on the `t_student_course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `t_student_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `course_id` on the `t_student_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sub_lesson_id` on the `t_student_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `t_wondering_score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `sub_lesson_id` on the `t_wondering_score` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

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

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_class_id_fkey";

-- AlterTable
ALTER TABLE "class" DROP CONSTRAINT "class_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "teacher_id",
ADD COLUMN     "teacher_id" INTEGER,
ADD CONSTRAINT "class_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "code_question" DROP CONSTRAINT "code_question_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sub_lesson_id",
ADD COLUMN     "sub_lesson_id" INTEGER NOT NULL,
ADD CONSTRAINT "code_question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "courses" DROP CONSTRAINT "courses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "essay_question" DROP CONSTRAINT "essay_question_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sub_lesson_id",
ADD COLUMN     "sub_lesson_id" INTEGER,
DROP COLUMN "code_question_id",
ADD COLUMN     "code_question_id" INTEGER,
ADD CONSTRAINT "essay_question_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "materials" DROP CONSTRAINT "materials_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "sub_lesson_id",
ADD COLUMN     "sub_lesson_id" INTEGER NOT NULL,
ADD CONSTRAINT "materials_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "sublessons" DROP CONSTRAINT "sublessons_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "lesson_id",
ADD COLUMN     "lesson_id" INTEGER NOT NULL,
ADD CONSTRAINT "sublessons_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_code_answer" DROP CONSTRAINT "t_code_answer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "code_question_id",
ADD COLUMN     "code_question_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_code_answer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_code_history_logs" DROP CONSTRAINT "t_code_history_logs_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "code_question_id",
ADD COLUMN     "code_question_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_code_history_logs_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_essay_answer" DROP CONSTRAINT "t_essay_answer_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "essay_question_id",
ADD COLUMN     "essay_question_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_essay_answer_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_student_course" DROP CONSTRAINT "t_student_course_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "student_id",
ADD COLUMN     "student_id" INTEGER NOT NULL,
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_student_course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_student_progress" DROP CONSTRAINT "t_student_progress_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
DROP COLUMN "sub_lesson_id",
ADD COLUMN     "sub_lesson_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_student_progress_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "t_wondering_score" DROP CONSTRAINT "t_wondering_score_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
DROP COLUMN "sub_lesson_id",
ADD COLUMN     "sub_lesson_id" INTEGER NOT NULL,
ADD CONSTRAINT "t_wondering_score_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "class_id",
ADD COLUMN     "class_id" INTEGER,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
