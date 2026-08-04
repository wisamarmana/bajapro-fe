// 📂 hooks/useQuestion.tsx
import { useState, useCallback } from "react";
import { App } from "antd";
import { useRouter } from "next/navigation";
import * as api from "@/src/actions/code_question/questionApi";
import { CodeFormData, QuestionRecord } from "@/src/types/code_question";

export const useQuestion = () => {
  const router = useRouter();
  const { message } = App.useApp(); 
  
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [fetching, setFetching] = useState(false);

  // ==========================================
  // STATE UNTUK MASTER DATA DROPDOWN
  // ==========================================
  const [courses, setCourses] = useState<{ label: string; value: string | number }[]>([]);
  const [lessons, setLessons] = useState<{ label: string; value: string | number }[]>([]);
  const [subLessons, setSubLessons] = useState<{ label: string; value: string | number }[]>([]);

  // ==========================================
  // HANDLER UNTUK FETCH DROPDOWN
  // ==========================================
  const loadCourses = useCallback(async () => {
    const data = await api.fetchCoursesApi();

    setCourses(data.map((c: { id: string | number; course_name: string }) => ({ label: c.course_name, value: Number(c.id) })));
  }, []);

  const loadLessons = useCallback(async (courseId: number | string) => {
    const res = await api.fetchLessonsByCourseApi(courseId);
    
    setLessons(res.map((l: { id: string | number; title: string }) => ({ label: l.title, value: Number(l.id) })));
  }, []);

  const loadSubLessons = useCallback(async (lessonId: number | string) => {
    const res = await api.fetchSubLessonsByLessonApi(lessonId);
    setSubLessons(res.map((sl: { id: string | number; title: string }) => ({ label: sl.title, value: Number(sl.id) })));
  }, []);

  const clearSubLessons = useCallback(() => setSubLessons([]), []);

  // ==========================================
  // CRUD UTAMA (Sama seperti sebelumnya)
  // ==========================================
  const fetchQuestions = useCallback(async (courseId?: number, subLessonId?: number) => {
    setFetching(true);
    try {
      const data = await api.fetchCodeQuestionsApi(courseId, subLessonId);
      setQuestions(data);
    } catch (error) {
      message.error("Gagal mengambil daftar pertanyaan.");
    } finally {
      setFetching(false);
    }
  }, [message]);

  const handleSaveQuestion = async (values: CodeFormData, editId?: number | string) => {
    setLoading(true);
    try {
      if (editId) {
        await api.updateQuestionApi(editId, values);
        message.success("Pertanyaan berhasil diperbarui!");
      } else {
        await api.createQuestionApi(values);
        message.success("Pertanyaan baru berhasil dibuat!");
      }
      router.push("/code_question"); 
    } catch (error) {
      console.error(error);
      message.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    setLoading(true);
    try {
      await api.deleteQuestionApi(id);
      message.success("Pertanyaan berhasil dihapus!");
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      message.error("Gagal menghapus pertanyaan.");
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    fetching, 
    questions, 
    fetchQuestions, 
    handleSaveQuestion, 
    handleDeleteQuestion,
    courses, lessons, subLessons, 
    loadCourses, loadLessons, loadSubLessons, clearSubLessons
  };
};
