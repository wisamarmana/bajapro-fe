

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

export const LeaderboardApi = {
  getClasses: () => handleFetch(`${BASE_URL}/class`),

  getClassesByTeacher: (teacherId: string | number) =>
    handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`),

  getCourses: () => handleFetch(`${BASE_URL}/courses`),

  getStudentsRanking: async (
    courseId: string | number,
    classId?: string | number | null
  ) => {
    let url = `${BASE_URL}/student/leaderboard?course_id=${courseId}`;

    if (classId) {
      url += `&class_id=${classId}`;
    }

    const result = await handleFetch(url);

    if (Array.isArray(result)) {
      return result;
    }

    if (result?.data && Array.isArray(result.data)) {
      return result.data;
    }

    return [];
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

  getWonderingScores: (userId: string | number) =>
    handleFetch(`${BASE_URL}/t_wondering_score?user_id=${userId}`),

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
    handleFetch(`${BASE_URL}/t_essay_answer?user_id=${userId}&essay_question_id=${subLessonId}`),

}

