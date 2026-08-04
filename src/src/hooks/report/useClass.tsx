import { useState, useEffect } from 'react';
import { reportApi } from "@/src/actions/report/reportApi"; 
import { UserData } from "@/src/types/users";

export type FilteredStudent = UserData & { courseId: string | number; totalScore: number };

export const useClass = (classId?: string | number, courseId?: string | number) => {
  const [loading, setLoading] = useState<boolean>(!!(classId && courseId));
  const [students, setStudents] = useState<FilteredStudent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId || !courseId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [data, essayAnswers] = await Promise.all([
          reportApi.getStudentsByClassAndCourse(classId, courseId),
          reportApi.getAllEssayAnswers()
        ]);
        
        const studentsWithStatus = data.map((student: any) => {
          const studentEssays = essayAnswers.filter((ea: any) => ea.user_id == student.id);
          
          let studentStatus = 'pending';
          if (studentEssays.length > 0) {
            const hasReject = studentEssays.some((ea: any) => ea.is_approved_by_teacher === 0 || ea.is_approved_by_teacher == false || ea.is_approved_by_teacher === 'false' || ea.is_approved_by_teacher === 'no' || ea.is_approved_by_teacher === 'reject');
            const hasPending = studentEssays.some((ea: any) => ea.is_approved_by_teacher === null || ea.is_approved_by_teacher === 'pending');
            
            if (hasReject) {
              studentStatus = 'reject';
            } else if (hasPending) {
              studentStatus = 'pending';
            } else {
              studentStatus = 'approve';
            }
          }
          
          return { ...student, status: studentStatus };
        });

        setStudents(studentsWithStatus);
      } catch (err: unknown) { 
        console.error("Gagal memuat data dari API:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [classId, courseId]);

  return { students, loading, error };
};
