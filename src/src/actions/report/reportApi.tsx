import {
  CodeAnswer,
  EssayAnswer,
  StudentProgress,
  StudentCourse,
  CodeHistoryLog,
} from "@/src/types/report";

import { UserData } from "@/src/types/users";

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "/api";
  if (typeof window === "undefined" && url.startsWith("/")) {
    if (process.env.VERCEL_URL) {
      url = "https://" + process.env.VERCEL_URL + url;
    } else {
      const port = process.env.PORT || 3000;
      url = `http://localhost:${port}${url}`;
    }
  }
  return url;
};
const BASE_URL = getBaseUrl();

const USE_REAL_API = true;

// app/report/api/reportApi.tsx

const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    try {
      // 1. Ambil token dari localStorage (sesuaikan nama key dengan yang dipakai saat fitur login nanti)
      let token = "";
      if (typeof window !== "undefined") {
        token = localStorage.getItem("token") || ""; 
      }

      // 2. Siapkan konfigurasi fetch baru dengan menyisipkan Header
      const customOptions: RequestInit = {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // Jika token ada, tambahkan header Authorization
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Tetap pertahankan header bawaan jika sebelumnya dikirim di parameter 'options'
          ...(options?.headers || {}), 
        },
      };

      const response = await fetch(url, customOptions);
      
      if (!response.ok) {
        // 3. Tangani jika Token tidak valid (401) atau Role tidak punya akses (403)
        if (response.status === 401 || response.status === 403) {
          console.warn("Akses ditolak atau sesi kedaluwarsa. Redirecting ke login...");
          // Nanti Anda bisa memanggil fungsi logout() atau window.location.href = '/login' di sini
        }

        // Tampilkan error yang lebih spesifik di console
        console.error(`Fetch Error: ${response.status} - ${response.statusText} pada URL: ${url}`);
        throw new Error(`Server Error (${response.status}): ${response.statusText}`);
      }
      
      return response.json();
    } catch (err) {
      console.error("Network Error:", err);
      throw err;
    }
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

export const reportApi = {
  getClasses: () => handleFetch(`${BASE_URL}/class`),

  getClassesByTeacher: (teacherId: string | number) =>
    handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`),


  getCourses: () => handleFetch(`${BASE_URL}/courses`),

  getStudentsByClassAndCourse: async (
    classId: string | number,
    courseId: string | number,
  ) => {
    const students = await handleFetch(
      `${BASE_URL}/users?class_id=${classId}&role_id=3`,
    );
    const courses = await handleFetch(
      `${BASE_URL}/t_student_course?course_id=${courseId}`,
    );

    const studentsCourses = students.map((student: UserData) => {
      const matchedCourse = courses.find((course: any) => course.student_id == student.id);
      
      return {
        ...student,
        courseId: matchedCourse?.course_id || null,
        totalScore: matchedCourse?.total_score || 0,
      };
    });

    return studentsCourses;
  },

  getStudentCourse: (userId: string | number, courseId: string | number) =>
    handleFetch(`${BASE_URL}/t_student_course?student_id=${userId}&course_id=${courseId}`),

  getAllStudentCourses: (courseId: string | number) =>
    handleFetch(`${BASE_URL}/t_student_course?course_id=${courseId}`),

  getStudentProgress: (userId: string | number, courseId: string | number) =>
    handleFetch(`${BASE_URL}/t_student_progress?user_id=${userId}&course_id=${courseId}`),

  getLessons: (courseId: string | number) =>
    handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`),

  getSublessons: (lessonId: string | number) =>
    handleFetch(`${BASE_URL}/sublessons?lesson_id=${lessonId}`),

  getSublesson: (subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/sublessons/${subLessonId}`),

  getWonderingScores: (userId: string | number) =>
    handleFetch(`${BASE_URL}/t_wondering_score?user_id=${userId}`),

  getWonderingScoreBySubLesson: (userId: string | number, subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/t_wondering_score?user_id=${userId}&sub_lesson_id=${subLessonId}`),

  getCodeAnswers: (userId: string | number) =>
    handleFetch(`${BASE_URL}/t_code_answer?user_id=${userId}`),

  getEssayAnswers: (userId: string | number) =>
    handleFetch(`${BASE_URL}/t_essay_answer?user_id=${userId}`),

  getAllEssayAnswers: () =>
    handleFetch(`${BASE_URL}/t_essay_answer`),

  getCodeQuestions: () =>
    handleFetch(`${BASE_URL}/code_question`),

  getEssayQuestions: () =>
    handleFetch(`${BASE_URL}/essay_question`),

  getBadges: () =>
    handleFetch(`${BASE_URL}/badges`),

  getUser: (userId: string | number) =>
    handleFetch(`${BASE_URL}/users/${userId}`),

  getEssayAnswer: (userId: string | number, subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/t_essay_answer?user_id=${userId}&essay_question_id=${subLessonId}`), // Wait, essay_question_id? Sublesson id isn't in t_essay_answer directly. Let's fix that.

  getCodeLogs: (userId: string | number, subLessonId: string | number) =>
    handleFetch(`${BASE_URL}/t_code_history_logs?user_id=${userId}&code_question_id=${subLessonId}`),

  updateEssayGrade: (
    essayId: string | number,
    data: {
      konteks_penjelasan: number;
      keruntutan: number;
      kebenaran: number;
      teacher_notes: string;
      is_approved_by_teacher: boolean | string;
    },
  ) =>
    handleFetch(`${BASE_URL}/t_essay_answer/${essayId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  updateProgressStatus: (progressId: string | number, status: string) =>
    handleFetch(`${BASE_URL}/t_student_progress/${progressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
};
