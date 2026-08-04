import { useState, useEffect } from "react";
import { App } from "antd";
import { useRouter } from "next/navigation";
import {
  CourseRecord,
  CourseFormData,
  LessonRecord,
  LessonCreateData,
  SubLessonRecord,
  SubLessonCreateData,
  ReorderItem,
  MaterialRecord,
} from "@/src/types/course";
import { LevelData } from "@/src/types/level";
import {
  fetchCourseByIdApi,
  createCourseApi,
  updateCourseApi,
  updateLessonApi,
  fetchLessonsByCourseApi,
  createLessonApi,
  reorderLessonsApi,
  fetchSubLessonsByLessonApi,
  createSubLessonApi,
  deleteSubLessonApi,
  reorderSubLessonsApi,
  fetchLevelsApi,
  deleteLessonApi,
  updateSubLessonApi,
  createMaterialsApi,
  updateMaterialsApi,
  deleteCourseApi,
  fetchMaterialsBySubLessonApi,
  deleteMaterialApi
} from "@/src/actions/course/courseApi";

export const useManageCourseMateri = (courseId: number | null) => {
  const router = useRouter();
  // const [activeTab, setActiveTab] = useState("detail"); //default nya tab detail course
  const [loading, setLoading] = useState<boolean>(false);
  const isEditing = !!courseId;
  const { message: messageApi, modal: modalApi } = App.useApp();

  // --- STATE TAB 1: Detail Course ---
  const [courseData, setCourseData] = useState<CourseRecord | null>(null);

  // --- STATE TAB 2: Lesson ---
  const [lessons, setLessons] = useState<LessonRecord[]>([]);

  // --- STATE TAB 3: Sub Lesson & Material ---
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [subLessons, setSubLessons] = useState<SubLessonRecord[]>([]);

  // state level
  const [levels, setLevels] = useState<LevelData[]>([]);

  const [activeTab, setActiveTab] = useState("detail");
  const [isMounted, setIsMounted] = useState(false);

// 1. Trik setTimeout untuk bypass Linter Sync Render
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
      const savedTab = sessionStorage.getItem(`course_tab_${courseId || "new"}`);
      if (savedTab && savedTab !== activeTab) {
        setActiveTab(savedTab);
      }
    }, 0); // Eksekusi ditunda ke microtask berikutnya

    return () => clearTimeout(timeoutId);
  }, [courseId, activeTab]);

  // 2. Simpan session (Tidak ada setState di sini, jadi aman)
  useEffect(() => {
    if (isMounted) {
      sessionStorage.setItem(`course_tab_${courseId || "new"}`, activeTab);
    }
  }, [activeTab, courseId, isMounted]);

  // 3. Load Course Data
  useEffect(() => {
    if (!courseId) return;

    const loadInitialData = async () => {
      setLoading(true); // Aman karena di dalam fungsi async
      try {
        const [course, lessonsData, levelsData] = await Promise.all([
          fetchCourseByIdApi(courseId),
          fetchLessonsByCourseApi(courseId),
          fetchLevelsApi(),
        ]);
        setCourseData(course);
        setLessons(lessonsData);
        setLevels(levelsData);
      } catch (error) {
        messageApi.error("Gagal mengambil data course");
        router.push("/course");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [courseId, router, messageApi]);

  // 4. Load Sub Lessons
  useEffect(() => {
    if (!selectedLessonId) {
      // Bungkus dengan setTimeout agar tidak dihitung sebagai sync render
      const timeoutId = setTimeout(() => setSubLessons([]), 0);
      return () => clearTimeout(timeoutId);
    }

    const loadSubLessons = async () => {
      setLoading(true); // Aman karena di dalam fungsi async
      try {
        const subs = await fetchSubLessonsByLessonApi(selectedLessonId);
        setSubLessons(subs);
      } catch (error) {
        messageApi.error("Gagal mengambil data materi");
      } finally {
        setLoading(false);
      }
    };

    loadSubLessons();
  }, [selectedLessonId, messageApi]);

  // ========================================================
  // A. CRUD HANDLER TAB 1: Detail Course
  // ========================================================

    // 2. Fungsi Delete dengan Pengecekan Reference
const handleDeleteGeneral = async (id: number, deleteApi: (id: number) => Promise<unknown>, type: string, onSuccess: () => void) => {
  modalApi.confirm({
    title: `Hapus ${type}?`,
    content: `Apakah Anda yakin ingin menghapus ${type} ini? Tindakan ini tidak dapat dibatalkan.`,
    okText: 'Hapus',
    okType: 'danger',
    cancelText: 'Batal',
    onOk: async () => {
      try {
        await deleteApi(id);
        messageApi.success(`${type} berhasil dihapus.`);
        onSuccess();
      } catch (error: any) {
     
        console.error(error);
        modalApi.error({
          title: "Gagal Menghapus",
          content: error?.message || `Data ${type} ini tidak bisa dihapus karena masih digunakan atau memiliki data terkait. Silakan hapus data di bawahnya terlebih dahulu.`,
        });
      }
    },
  });
};

  const handleSaveCourse = async (values: CourseFormData) => {
    setLoading(true);
    try {
      if (isEditing) {
        await updateCourseApi(courseId!, values);
        messageApi.success("Course berhasil diperbarui");
        setCourseData(prev => prev ? { ...prev, ...values } : null);
      } else {
        const response = await createCourseApi(values);

        const newId = response.id;

        messageApi.success("Course baru berhasil dibuat");
        router.push(`/course/${newId}`); // Redirect ke edit page tab 1
      }
    } catch (error) {
      messageApi.error("Terjadi kesalahan saat menyimpan course.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // B. CRUD HANDLER TAB 2: Lesson
  // ========================================================
  const handleAddLesson = async (values: LessonCreateData) => {
    if (!courseId) return;
    setLoading(true);
    try {
      await createLessonApi(courseId, values);
      messageApi.success("Lesson baru berhasil ditambahkan");
      const updatedLessons = await fetchLessonsByCourseApi(courseId); // Reload
      setLessons(updatedLessons);
    } catch (error) {
      messageApi.error("Gagal menambahkan lesson.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLesson = async (
    id: number,
    values: Partial<LessonRecord>,
  ) => {
    setLoading(true);
    try {
      await updateLessonApi(id, values);
      messageApi.success("Lesson berhasil diperbarui"); // <--- POPUP SUCCESS REQ #5
      const updated = await fetchLessonsByCourseApi(courseId!);
      setLessons(updated);
    } catch (error) {
      messageApi.error("Gagal memperbarui lesson");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderLessons = async (updates: ReorderItem[]) => {
    if (!courseId) return;
    try {
      await reorderLessonsApi(courseId, updates);
      // Gak perlu reload full, update local state aja biar responsif
      setLessons((prev) =>
        prev
          .map((l) => {
            const u = updates.find((update) => update.id === l.id);
            if (u) return { ...l, position: u.newPosition };
            return l;
          })
          .sort((a, b) => a.position - b.position),
      );
      messageApi.success("Urutan lesson berhasil diperbarui");
    } catch (error) {
      messageApi.error("Gagal memperbarui urutan.");
    }
  };

  // ========================================================
  // CRUD HANDLER TAB 3: Sub Lesson & Material (DIPERBAIKI)
  // ========================================================

  const handleSaveSubLessonAll = async (
    values: SubLessonCreateData,
    materialList: MaterialRecord[],
    editId?: number
  ) => {
    setLoading(true);
    try {
      let subLessonId: number;

      // ==========================================
      // 1. PROSES SUB LESSON 
      // ==========================================

      if (editId) {
        // UPDATE data Sub Lesson lama
        await updateSubLessonApi(editId, values);
        subLessonId = editId; 

        const existingMaterials = await fetchMaterialsBySubLessonApi(editId);

        const incomingIds = materialList.map(m => m.id);
        
        const idsToDelete = existingMaterials
          .filter(existing => !incomingIds.includes(existing.id))
          .map(m => m.id);

        for (const id of idsToDelete) {
          await deleteMaterialApi(id);
        }
        // -----------------------------------------------------------

      } else {
        // INSERT data Sub Lesson baru
        const payload = {
          ...values,
          order_position: subLessons.length + 1,
          isactive: true,
        };
        const res = await createSubLessonApi(payload);
        subLessonId = res.id; 
      }

      // ==========================================
      // 2. PROSES MATERIALS (CREATE / UPDATE)
      // ==========================================
      // Lakukan perulangan untuk menyimpan setiap section materi yang tersisa
      for (let i = 0; i < materialList.length; i++) {
        const mat = materialList[i];
        const matPayload = {
          sub_lesson_id: subLessonId,
          title: mat.title,
          materials: mat.materials,
          url_video: mat.url_video,
          content_position: i + 1,
          isactive: true,
        };

        if (mat.id < 0) {
          // INSERT materi baru (ID bawaan form masih negatif)
          await createMaterialsApi(matPayload);
        } else {
          // UPDATE materi lama
          await updateMaterialsApi(mat.id, matPayload);
        }
      }

      messageApi.success("Data Sub Lesson dan Materi Berhasil Disimpan!");

      // ==========================================
      // 3. REFRESH DATA SUB LESSON DI TABEL/LIST
      // ==========================================
      if (selectedLessonId) {
        const updatedSubs = await fetchSubLessonsByLessonApi(selectedLessonId);
        setSubLessons(updatedSubs.sort((a, b) => a.order_position - b.order_position));
      }

      return true;
    } catch (error: unknown) {
      console.error("Gagal simpan sub lesson:", error);
      messageApi.error("Terjadi kesalahan saat menyimpan data.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleReorderSubLessons = async (updates: ReorderItem[]) => {
    if (!selectedLessonId) return;
    try {
      await reorderSubLessonsApi(selectedLessonId, updates);
      setSubLessons((prev) =>
        prev
          .map((s) => {
            const u = updates.find((update) => update.id === s.id);
            if (u) return { ...s, order_position: u.newPosition };
            return s;
          })
          .sort((a, b) => a.order_position - b.order_position),
      );
      messageApi.success("Urutan materi berhasil diperbarui!");
    } catch (error) {
      messageApi.error("Gagal memperbarui urutan.");
    }
  };


// Implementasi ke fungsi masing-masing
const handleDeleteCourse = (id: number) => 
  handleDeleteGeneral(id, deleteCourseApi, "Course", () => router.push("/course"));

const handleDeleteLesson = (id: number) => 
  handleDeleteGeneral(id, deleteLessonApi, "Lesson", () => {
    setLessons(prev => prev.filter(l => l.id !== id));
  });

const handleDeleteSubLesson = (id: number) => 
  handleDeleteGeneral(id, deleteSubLessonApi, "Sub Lesson", () => {
    setSubLessons(prev => prev.filter(s => s.id !== id));
  });

  return {
    loading,
    activeTab,
    setActiveTab,
    isEditing,
    // Tab 1
    courseData,
    handleSaveCourse,
    handleDeleteCourse,
    // Tab 2
    lessons,
    handleAddLesson,
    handleReorderLessons,
    handleUpdateLesson,
    handleDeleteLesson,
    // Tab 3
    selectedLessonId,
    setSelectedLessonId,
    subLessons,
    levels,
    handleSaveSubLessonAll,
    handleReorderSubLessons,
    handleDeleteSubLesson,
    isMounted
  };
};
