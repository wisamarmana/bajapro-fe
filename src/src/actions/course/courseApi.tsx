import {
  CourseRecord,
  CourseFormData,
  LessonRecord,
  LessonCreateData,
  SubLessonRecord,
  SubLessonCreateData,
  ReorderItem,
  MaterialRecord,
  MaterialsCreateData
} from "@/src/types/course";

import { LevelData } from "@/src/types/level";

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

// ---------------------------------------------------------
// 1. DUMMY DATA (untuk simulasi API tanpa backend)
// ---------------------------------------------------------
let dummyCourses: CourseRecord[] = [
  {
    id: 1,
    course_name: "Java Basic 1",
    description: "Learn Java foundations.",
    img_thumbnail: "/assets/java-thumb.png",
    published_: true,
    isactive: true,
  },
  {
    id: 2,
    course_name: "Java Basic 2",
    description: "Medium level Java.",
    img_thumbnail: "/assets/java-thumb-2.png",
    published_: false,
    isactive: true,
  },
];

let dummyLessons: LessonRecord[] = [
  {
    id: 1,
    course_id: 1,
    level_id: 1,
    title: "Introduction",
    description: "Intro to Java",
    position: 1,
    img_thumbnail: null,
    isactive: true,
  },
  {
    id: 2,
    course_id: 1,
    level_id: 2,
    title: "Variables",
    description: "Data types & Variables",
    position: 2,
    img_thumbnail: null,
    isactive: true,
  },
];

// ---------------------------------------------------------
// 2. HELPER UNTUK FETCH
// ---------------------------------------------------------
const handleFetch = async (url: string, options?: RequestInit) => {
  if (USE_REAL_API) {
    // Tambahkan cache: 'no-store' agar server component selalu mengambil data terbaru
    const response = await fetch(url, { ...options, cache: 'no-store', credentials: 'include' });
    if (!response.ok) throw new Error("Gagal mengakses server materi");
    return response.json();
  } else {
    // Simulasi loading
    return new Promise((resolve) => setTimeout(() => resolve(null), 300));
  }
};

// ---------------------------------------------------------
// 3. COURSE API FUNCTIONS
// ---------------------------------------------------------

// mengambil data seluruh course
export const fetchCoursesApi = async (): Promise<CourseRecord[]> => {
  if (USE_REAL_API) return handleFetch(`${BASE_URL}/courses`);
  return new Promise((resolve) =>
    setTimeout(() => resolve([...dummyCourses]), 0),
  );
};

// mengambil data course berdasarkan ID
export const fetchCourseByIdApi = async (id: number): Promise<CourseRecord> => {
  if (USE_REAL_API) return handleFetch(`${BASE_URL}/courses/${id}`);

  return new Promise((resolve) => {
    setTimeout(
      () => resolve(dummyCourses.find((item) => item.id == id) as CourseRecord),
      0,
    );
  });
};

export const createCourseApi = async (
  data: CourseFormData,
): Promise<CourseRecord> => {
  
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/courses`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal");

    return await response.json(); // Mengembalikan { id: "...", course_name: "..." }
  } else {
    const newId = dummyCourses.length + 1;
    const newCourse = { id: newId, ...data, isactive: true };
    dummyCourses.push(newCourse);
    return newCourse; // Mengembalikan objek utuh
  }
};

export const updateCourseApi = async (
  id: number,
  data: CourseFormData,
): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/courses/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Gagal update course");
  } else {
    dummyCourses = dummyCourses.map((item) =>
      item.id === id ? { ...item, ...data } : item,
    );
  }
};

export const deleteCourseApi = async (id: number): Promise<void> => {
  if (USE_REAL_API) {
    // 1. Cek apakah ada Lesson yang merujuk ke Course ini
    const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${id}`);
    if (lessons && lessons.length > 0) {
      throw new Error(`Gagal menghapus! Course ini masih memiliki ${lessons.length} Lesson (materi). Hapus semua Lesson terlebih dahulu.`);
    }

    await fetch(`${BASE_URL}/courses/${id}`, { method: "DELETE", credentials: "include" });
  } else {
    dummyCourses = dummyCourses.filter((item) => item.id != id);
  }
};

// --- LESSON (Tab 2) ---

export const fetchLessonsByCourseApi = async (
  courseId: number,
): Promise<LessonRecord[]> => {
  if (USE_REAL_API)
    return handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const filtered = dummyLessons
        .filter((item) => item.course_id == courseId)
        .sort((a, b) => a.position - b.position);
      resolve(filtered);
    }, 0);
  });
};

export const createLessonApi = async (
  courseId: number,
  data: LessonCreateData,
): Promise<void> => {
  if (USE_REAL_API) {
    const payload = {
      ...data,
      course_id: courseId,
    };
    const response = await fetch(`${BASE_URL}/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Gagal menambah lesson");
  } else {
    const courseLessons = dummyLessons.filter((l) => l.course_id === courseId);
    dummyLessons.push({
      id: dummyLessons.length + 1,
      ...data,
      course_id: courseId,
      position: courseLessons.length + 1,
      isactive: true,
    });
  }
};

export const updateLessonApi = async (
  id: number,
  data: Partial<LessonRecord>,
): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/lessons/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Gagal mengupdate lesson");
    }
  } else {
    console.log("Mock Update Lesson:", id, data);
  }
};

export const reorderLessonsApi = async (
  id: number,
  updates: ReorderItem[],
): Promise<void> => {
  if (USE_REAL_API) {
    await fetch(`${BASE_URL}/lessons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
  } else {
    dummyLessons = dummyLessons.map((lesson) => {
      const update = updates.find((u) => u.id == lesson.id);
      if (update) return { ...lesson, position: update.newPosition };
      return lesson;
    });
  }
};

export const deleteLessonApi = async (id: number): Promise<void> => {
  if (USE_REAL_API) {
    // 1. Cek apakah ada Sub-Lesson yang merujuk ke Lesson ini
    const subLessons = await handleFetch(`${BASE_URL}/sublessons?lesson_id=${id}`);
    if (subLessons && subLessons.length > 0) {
      throw new Error(`Gagal menghapus! Lesson ini masih memiliki ${subLessons.length} Sub-Lesson. Hapus semua Sub-Lesson terlebih dahulu.`);
    }

    await fetch(`${BASE_URL}/lessons/${id}`, {
      method: "DELETE",
    });
  } else {
    // Simulasi hapus di dummy data
    dummyLessons = dummyLessons.filter((item) => item.id != id);
  }
};

// --- SUB LESSON (Tab 3) ---

// AMBIL SEMUA DATA SUBLESSON BY LESSON ID
export const fetchSubLessonsByLessonApi = (
  lessonId: number,
): Promise<SubLessonRecord[]> =>
  handleFetch(`${BASE_URL}/sublessons?lesson_id=${lessonId}`);

// CREATE SUBLESSON
export const createSubLessonApi = async (
  data: SubLessonCreateData & { lesson_id: number } 
): Promise<SubLessonRecord> => {
  return handleFetch(`${BASE_URL}/sublessons`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// UPDATE SUB LESSON
export const updateSubLessonApi = async (
  id: number,
  data: SubLessonCreateData
): Promise<void> => {
  await handleFetch(`${BASE_URL}/sublessons/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// REORDER POSISI Sublessons DI LIST TAB
export const reorderSubLessonsApi = (
  id: number,
  updates: ReorderItem[],
) => {
  return handleFetch(`${BASE_URL}/sublessons/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
};

// --- MATERIAL (Tab 3) ---
export const fetchMaterialsBySubLessonApi = (
  sublessonId: number,
): Promise<MaterialRecord[]> =>
  handleFetch(`${BASE_URL}/materials?sub_lesson_id=${sublessonId}`);

// CREATE SUBLESSON
export const createMaterialsApi = async (
  data: MaterialsCreateData & { sub_lesson_id: number; content_position: number }
): Promise<void> => {
  await handleFetch(`${BASE_URL}/materials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// UPDATE SUB LESSON
export const updateMaterialsApi = async (
  id: number,
  data: Partial<MaterialRecord>, 
): Promise<void> => {
  if (USE_REAL_API) {
    const response = await fetch(`${BASE_URL}/materials/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Gagal mengupdate materials");
    }
  } else {
    console.log("Mock Update materials:", id, data);
  }
};

// DELETE Sublesson
export const deleteSubLessonApi = async (id: number): Promise<void> => {
  return handleFetch(`${BASE_URL}/sublessons/${id}`, { method: "DELETE" });
};

// DELETE Material
export const deleteMaterialApi = (id: number) =>
  handleFetch(`${BASE_URL}/materials/${id}`, { method: "DELETE" });

// REORDER POSISI materials DI LIST TAB
export const reorderMaterialsApi = (
  id: number,
  updates: ReorderItem[],
) => {
  return handleFetch(`${BASE_URL}/materials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
};

// --- LEVEL (Tab 3) ---
export const fetchLevelsApi = async (): Promise<LevelData[]> => {
  if (USE_REAL_API) {
    return handleFetch(`${BASE_URL}/levels`); // Sesuaikan dengan endpoint level di backend kamu
  } else {
    // Dummy data jika tidak pakai real API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 1, level_name: "Easy", deskripsi: "ya", isactive: "1" },
          { id: 2, level_name: "Medium", deskripsi: "ya", isactive: "1" },
          { id: 3, level_name: "Hard", deskripsi: "ya", isactive: "1" },
        ]);
      }, 0);
    });
  }
};
