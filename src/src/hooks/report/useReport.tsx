import { useState, useEffect } from 'react';
import { reportApi } from "@/src/actions/report/reportApi"; 
import { EssayAnswer, CodeHistoryLog, StudentProgress } from "@/src/types/report"; 
import { UserData } from "@/src/types/users";

export type FilteredStudent = UserData & { courseId: string | number; totalScore: number };

export interface DetailAnswerData {
  essay: EssayAnswer | null;
  logs: CodeHistoryLog[];
}

type ReportDataState = FilteredStudent[] | StudentProgress[] | DetailAnswerData | null;

export const useReport = (
  classId?: string | number, 
  courseId?: string | number, 
  userId?: string | number, 
  subLessonId?: string | number
) => {
  // PERBAIKAN 1: Tentukan nilai awal 'loading' secara pintar. 
  // Jika ada ID yang dilempar, berarti akan ada proses fetch (true). Jika kosong, biarkan false.
  const hasParams = !!(classId || courseId || userId || subLessonId);
  const [loading, setLoading] = useState<boolean>(hasParams);
  
  const [data, setData] = useState<ReportDataState>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // PERBAIKAN 2: Jika tidak ada parameter, langsung 'return' (keluar) dari useEffect.
    // Tidak perlu lagi memanggil setLoading(false) secara paksa di sini.
    if (!classId && !courseId && !userId && !subLessonId) {
      return; 
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (userId && subLessonId) {
          const [essay, logs] = await Promise.all([
            reportApi.getEssayAnswer(userId, subLessonId),
            reportApi.getCodeLogs(userId, subLessonId)
          ]);
          
          setData({ 
            essay: essay && essay.length > 0 ? essay[0] : null, 
            logs: logs || [] 
          });
        } 
        else if (userId && courseId) {
          const progress = await reportApi.getStudentProgress(userId, courseId);
          setData(progress);
        } 
        else if (classId && courseId) {
          const students = await reportApi.getStudentsByClassAndCourse(classId, courseId);
          setData(students);
        }
      } catch (err: unknown) { 
        console.error("Gagal memuat data dari API:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan saat mengambil data");
        }
      } finally {
        // Ini aman karena berada di dalam fungsi asynchronous (setelah await selesai)
        setLoading(false);
      }
    };
    
    // Panggil fungsinya
    loadData();

  }, [classId, courseId, userId, subLessonId]);

  return { data, loading, error, setData };
};
