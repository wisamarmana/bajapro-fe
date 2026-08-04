import {QuestionRecord, CodeFormData, EssayFormData} from "@/src/types/code_question";
import { CourseRecord, LessonRecord, SubLessonRecord } from "@/src/types/course";

// Ambil alamat URL dari file .env.local
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

// handle fetch
const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    const response = await fetch(url, { ...options, credentials: "include" });
    if (!response.ok) throw new Error("Gagal mengakses server question");
    return response.json();
  } else {
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

// --- API UNTUK DROPDOWN MATERI ---
export const fetchCoursesApi = async () => handleFetch(`${BASE_URL}/courses`);
export const fetchLessonsByCourseApi = async (courseId: number | string) => handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
export const fetchSubLessonsByLessonApi = async (lessonId: number | string) => handleFetch(`${BASE_URL}/sublessons?lesson_id=${lessonId}`);

// FETCH QUESTION JIKA ADA FILTER SUBLESSON
export const fetchCodeQuestionsApi = async (courseId?: number | string, subLessonId?: number | string): Promise<QuestionRecord[]> => {
  // ✅ FIX: Gunakan URLSearchParams agar "?" dan "&" tidak salah posisi
  const params = new URLSearchParams();
  if (subLessonId) params.set("sub_lesson_id", String(subLessonId));
  const query = params.toString();
  const url = `${BASE_URL}/code_question${query ? `?${query}` : ""}`;

  const questions: QuestionRecord[] = await handleFetch(url);
  if (questions.length === 0) return questions;
  try {
    // 1. Ambil semua sublessons sekaligus lewat query (lebih efisien dari fetch per-id)
    const allSubLessons: SubLessonRecord[] = await handleFetch(`${BASE_URL}/sublessons`);
    const subLessonMap = new Map<string, SubLessonRecord>();
    allSubLessons.forEach((sl) => subLessonMap.set(String(sl.id), sl));

    // 2. Ambil semua lessons
    const allLessons: LessonRecord[] = await handleFetch(`${BASE_URL}/lessons`);
    const lessonMap = new Map<string, LessonRecord>();
    allLessons.forEach((l) => lessonMap.set(String(l.id), l));

    // 3. Ambil semua courses
    const allCourses: CourseRecord[] = await handleFetch(`${BASE_URL}/courses`);
    const courseMap = new Map<string, string>();
    allCourses.forEach((c) => courseMap.set(String(c.id), c.course_name ?? ""));

    // 4. Enrich tiap question
    const enriched = questions.map((q) => {
      const sl = subLessonMap.get(String(q.sub_lesson_id));
      const lesson = sl ? lessonMap.get(String(sl.lesson_id)) : undefined;
      const courseName = lesson ? courseMap.get(String(lesson.course_id)) : undefined;
      return {
        ...q,
        sub_lesson_name: sl?.title ?? q.sub_lesson_name ?? "-",
        course_name: courseName ?? q.course_name ?? "-",
        course_id: lesson?.course_id ?? q.course_id,
        lesson_id: sl?.lesson_id ?? q.lesson_id,
      };
    });

    if (courseId) {
      return enriched.filter((q) => String(q.course_id) === String(courseId));
    }
    return enriched;
  } catch {
    if (courseId) {
      return questions.filter((q) => String(q.course_id) === String(courseId));
    }
    return questions;
  }
};

// API UNTUK FILTER COURSE
export const fetchQuestionsByCourseApi = async (courseId: number | string): Promise<QuestionRecord[]> => {
  
  const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
  if (lessons.length === 0) return []; 

  const lessonQuery = lessons.map((l: LessonRecord) => `lesson_id=${l.id}`).join('&');
  const subLessons = await handleFetch(`${BASE_URL}/sublessons?${lessonQuery}`);
  if (subLessons.length === 0) return [];

  const subLessonQuery = subLessons.map((sl: SubLessonRecord) => `sub_lesson_id=${sl.id}`).join('&');
  const questions = await handleFetch(`${BASE_URL}/code_question?${subLessonQuery}`);

  return questions;
};

// API UNTUK FETCH DETAIL QUESTION
export const getQuestionDetailApi = async (id: number | string) => {
  const codeRes = await handleFetch(`${BASE_URL}/code_question/${id}`);
  const essayRes = await handleFetch(`${BASE_URL}/essay_question?code_question_id=${id}`);

  let lesson_id: number | string | undefined = codeRes.lesson_id;
  let course_id: number | string | undefined = codeRes.course_id;

  if (!lesson_id || !course_id) {
    try {
      // Fetch sublesson berdasarkan sub_lesson_id dari code_question
      const allSubLessons: SubLessonRecord[] = await handleFetch(`${BASE_URL}/sublessons`);
      const sl = allSubLessons.find((s) => String(s.id) === String(codeRes.sub_lesson_id));
      lesson_id = sl?.lesson_id ?? lesson_id;

      if (!course_id && lesson_id) {
        const allLessons: LessonRecord[] = await handleFetch(`${BASE_URL}/lessons`);
        const lesson = allLessons.find((l) => String(l.id) === String(lesson_id));
        course_id = lesson?.course_id ?? course_id;
      }
    } catch {
      // gagal enrich, lanjut dengan data yang ada
    }
  }

  return { ...codeRes, essays: essayRes, lesson_id, course_id };
};

export const fetchEssayByCodeIdApi = async (code_id: number) =>{
  return handleFetch(`${BASE_URL}/essay_question?code_question_id=${code_id}`);
}

// API UNTUK FETCH DETAIL QUESTION DENGAN SATU ENDPOINT (jika backend sudah support)
// export const getQuestionDetailApi = async (id: number): Promise<QuestionRecord> => {
//   const response = await handleFetch(`${BASE_URL}/question/${id}`);
  
//   return {
//     ...response,
//     essays: response.data_essay // Ganti key-nya agar cocok dengan form Ant Design kamu
//   }; 
// };

// API UNTUK CREATE QUESTION
export const createQuestionApi = async (data: CodeFormData) => {
  // 1. Simpan Code Question
  const codeRes = await fetch(`${BASE_URL}/code_question`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sub_lesson_id: data.sub_lesson_id,
      code_question: data.code_question,
      score: data.score,
      isactive: true,
    }),
  });
  const savedCode = await codeRes.json();

  // 2. Simpan 3 Essay secara bersamaan
  const essayPromises = data.essays.map((essay) =>
    fetch(`${BASE_URL}/essay_question`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...essay,
        code_question_id: savedCode.id,
        isactive: true,
      }),
    })
  );
  await Promise.all(essayPromises);

  return savedCode;
};

// export const createQuestionApi = async (codeData: CodeFormData, essayList: EssayFormData[]) =>{
  
//   const Essays = essayList && essayList.length > 0
//   ? essayList.map(essay => ({...essay, isactive: true}))
//   : [] ;

//   const payload = {
//     ...codeData,
//     isactive: true,
//     essays: Essays
//   };

//   const response = await fetch(`${BASE_URL}/questions`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload)
//   });

//   if (!response.ok) {
//     throw new Error("Gagal menyimpan data pertanyaan");
//   }

//   const savedQuestion = await response.json();
//   return savedQuestion;
// };

// API UNTUK UPDATE QUESTION
export const updateQuestionApi = async (id: number | string, data: CodeFormData) => {
  // 1. Update Code Question
  await fetch(`${BASE_URL}/code_question/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sub_lesson_id: data.sub_lesson_id,
      code_question: data.code_question,
      score: data.score,
    }),
  });

  // 2. Update 3 Essay
  const essayPromises = data.essays.map((essay) =>
    fetch(`${BASE_URL}/essay_question/${essay.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(essay),
    })
  );
  await Promise.all(essayPromises);
};

// export const updateQuestionApi = async (id: number, codeData: CodeFormData, essayList: EssayFormData[]) => {
//   const payload = {
//     ...codeData,
//     essays: essayList // Array ini berisi campuran essay lama (ada ID) dan baru (tanpa ID)
//   };

//   // Tembak 1 endpoint saja!
//   const response = await fetch(`${BASE_URL}/question/${id}`, {
//     method: "PUT", // Atau PATCH, pastikan ke tim Backend
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(payload),
//   });

//   if (!response.ok) {
//     throw new Error("Gagal mengupdate pertanyaan");
//   }

//   return { success: true };
// };

// API UNTUK DELETE QUESTION
export const checkQuestionReferencesApi = async (id: number) => {
  const essayRes = await handleFetch(`${BASE_URL}/essay_question?code_question_id=${id}`);
  const historyRes = await handleFetch(`${BASE_URL}/t_code_history_logs?code_question_id=${id}`);

  const isUsed = essayRes.length > 0 || historyRes.length > 0;
  return {
    isUsed,
    message: isUsed ? `Terdapat ${essayRes.length} soal essay dan ${historyRes.length} riwayat pengerjaan.` : ""
  };
};

export const deleteQuestionApi = async (codeId: number) => {
  // 1. Cek apakah ada essay (Wajib ada 3 di sistem ini biasanya, tapi kita cek keberadaannya sebagai data)
  // Namun karena sistem ini menghapus code_question beserta essay-nya, kita cek referensi LUAR (log pengerjaan)
  
  const historyLogs = await handleFetch(`${BASE_URL}/t_code_history_logs?code_question_id=${codeId}`);
  if (historyLogs && historyLogs.length > 0) {
    throw new Error(`Gagal menghapus! Pertanyaan ini sudah dikerjakan oleh siswa (${historyLogs.length} riwayat).`);
  }

  const studentAnswers = await handleFetch(`${BASE_URL}/t_code_answer?code_question_id=${codeId}`);
  if (studentAnswers && studentAnswers.length > 0) {
    throw new Error(`Gagal menghapus! Pertanyaan ini sudah memiliki jawaban tersimpan.`);
  }

  // 2. Jika aman, hapus essay-nya dulu
  const oldEssays = await handleFetch(`${BASE_URL}/essay_question?code_question_id=${codeId}`);
  const deletePromises = oldEssays.map((essay: { id: number }) =>
    fetch(`${BASE_URL}/essay_question/${essay.id}`, {
      method: "DELETE",
      credentials: "include",
    })
  );
  await Promise.all(deletePromises);

  // 3. Baru hapus Code Question
  await fetch(`${BASE_URL}/code_question/${codeId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export const fetchSubLessonDetailApi = async (id: string | number) => handleFetch(`${BASE_URL}/sublessons/${id}`);
export const fetchLessonDetailApi = async (id: string | number) => handleFetch(`${BASE_URL}/lessons/${id}`);
