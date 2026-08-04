-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role_name" TEXT NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class" (
    "id" TEXT NOT NULL,
    "teacher_id" INTEGER,
    "class_name" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "class_code" TEXT NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "class_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_approved_by_admin" INTEGER NOT NULL DEFAULT 0,
    "instansi_sekolah" TEXT NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" SERIAL NOT NULL,
    "course_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "img_thumbnail" TEXT,
    "published" INTEGER NOT NULL DEFAULT 0,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" SERIAL NOT NULL,
    "level_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "img_thumbnail" TEXT,
    "published" INTEGER NOT NULL DEFAULT 0,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sublessons" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "order_position" INTEGER NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sublessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" SERIAL NOT NULL,
    "sub_lesson_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "materials" TEXT NOT NULL,
    "url_video" TEXT,
    "content_position" INTEGER NOT NULL,
    "prompt_lim" TEXT,
    "published" INTEGER NOT NULL DEFAULT 1,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_question" (
    "id" SERIAL NOT NULL,
    "sub_lesson_id" INTEGER NOT NULL,
    "code_question" TEXT NOT NULL,
    "image" TEXT,
    "score" INTEGER NOT NULL DEFAULT 30,
    "hint" TEXT,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "code_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essay_question" (
    "id" SERIAL NOT NULL,
    "sub_lesson_id" INTEGER,
    "code_question_id" INTEGER,
    "essay_question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "answer_2" TEXT,
    "answer_3" TEXT,
    "answer_4" TEXT,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essay_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_student_course" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,
    "badge_id" INTEGER,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_student_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "min_score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_student_progress" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "sub_lesson_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_wondering_score" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "sub_lesson_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_wondering_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_code_answer" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code_question_id" INTEGER NOT NULL,
    "is_code_right" BOOLEAN NOT NULL DEFAULT false,
    "exploring_score" INTEGER NOT NULL DEFAULT 0,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_code_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_essay_answer" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "essay_question_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "konteks_penjelasan" INTEGER NOT NULL DEFAULT 0,
    "keruntutan" INTEGER NOT NULL DEFAULT 0,
    "kebenaran" INTEGER NOT NULL DEFAULT 0,
    "teacher_notes" TEXT,
    "is_approved_by_teacher" TEXT NOT NULL DEFAULT 'pending',
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_essay_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "t_code_history_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code_question_id" INTEGER NOT NULL,
    "time_count" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT NOT NULL,
    "is_error" BOOLEAN NOT NULL DEFAULT false,
    "isactive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "t_code_history_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "class_class_code_key" ON "class"("class_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sublessons" ADD CONSTRAINT "sublessons_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_question" ADD CONSTRAINT "code_question_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay_question" ADD CONSTRAINT "essay_question_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_course" ADD CONSTRAINT "t_student_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_course" ADD CONSTRAINT "t_student_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_course" ADD CONSTRAINT "t_student_course_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_student_progress" ADD CONSTRAINT "t_student_progress_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wondering_score" ADD CONSTRAINT "t_wondering_score_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_wondering_score" ADD CONSTRAINT "t_wondering_score_sub_lesson_id_fkey" FOREIGN KEY ("sub_lesson_id") REFERENCES "sublessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_answer" ADD CONSTRAINT "t_code_answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_answer" ADD CONSTRAINT "t_code_answer_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_essay_answer" ADD CONSTRAINT "t_essay_answer_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_essay_answer" ADD CONSTRAINT "t_essay_answer_essay_question_id_fkey" FOREIGN KEY ("essay_question_id") REFERENCES "essay_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_history_logs" ADD CONSTRAINT "t_code_history_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "t_code_history_logs" ADD CONSTRAINT "t_code_history_logs_code_question_id_fkey" FOREIGN KEY ("code_question_id") REFERENCES "code_question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
