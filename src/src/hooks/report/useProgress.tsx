import { useState, useEffect } from 'react';
import { reportApi } from "@/src/actions/report/reportApi";

export const useProgress = (userId?: string | number, courseId?: string | number) => {
  const [loading, setLoading] = useState<boolean>(!!(userId && courseId));
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !courseId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [
          user, badges, studentCourses, lessons, 
          progress, wonderingScores, codeAnswers, essayAnswers,
          codeQuestions, essayQuestions, allStudentCourses
        ] = await Promise.all([
          reportApi.getUser(userId),
          reportApi.getBadges(),
          reportApi.getStudentCourse(userId, courseId),
          reportApi.getLessons(courseId),
          reportApi.getStudentProgress(userId, courseId),
          reportApi.getWonderingScores(userId),
          reportApi.getCodeAnswers(userId),
          reportApi.getEssayAnswers(userId),
          reportApi.getCodeQuestions(),
          reportApi.getEssayQuestions(),
          reportApi.getAllStudentCourses(courseId)
        ]);

        const studentCourse = studentCourses && studentCourses.length > 0 ? studentCourses[0] : null;
        
        let currentBadge = badges.find((b: any) => b.id == studentCourse?.badge_id);
        if (!currentBadge && studentCourse?.total_score != null) {
          currentBadge = badges.find((b: any) => studentCourse.total_score >= b.min_score && studentCourse.total_score <= b.max_score) || badges[0];
        }

        const lessonIds = lessons.map((l: any) => l.id);
        
        // Fetch sublessons for all lessonIds sequentially (since json-server handles one by one or we could use Promise.all)
        const sublessonsArrays = await Promise.all(
          lessonIds.map((lId: any) => reportApi.getSublessons(lId))
        );
        const sublessons = sublessonsArrays.flat().filter((sl: any) => sl.isactive === true || sl.isActive === true || sl.isactive === 1 || sl.isactive === 'true' || sl.isactive === 'Aktif');

        const completedSublessonsCount = progress.filter((p: any) => p.status === 'completed').length;
        const totalSublessonsCount = sublessons.length;
        const progressPercentage = totalSublessonsCount > 0 ? Math.round((completedSublessonsCount / totalSublessonsCount) * 100) : 0;

        // Map sublessons to table rows and filter only completed ones
        const tableData = sublessons
          .filter((sl: any) => progress.some((p: any) => p.sub_lesson_id == sl.id && p.status === 'completed'))
          .map((sl: any) => {
            const slProgress = progress.find((p: any) => p.sub_lesson_id == sl.id);
            const wondering = wonderingScores.find((w: any) => w.sub_lesson_id == sl.id);
            
            const slCodeQs = codeQuestions.filter((cq: any) => cq.sub_lesson_id == sl.id);
            const slCodeAns = codeAnswers.filter((ca: any) => slCodeQs.some((cq: any) => cq.id == ca.code_question_id));
            const exploringScore = slCodeAns.reduce((acc: number, curr: any) => acc + (curr.exploring_score || 0), 0);

            const slEssayQs = essayQuestions.filter((eq: any) => slCodeQs.some((cq: any) => cq.id == eq.code_question_id));
            const slEssayAns = essayAnswers.filter((ea: any) => slEssayQs.some((eq: any) => eq.id == ea.essay_question_id));
            
            let explainScore = 0;
            slEssayAns.forEach((ea: any) => {
              explainScore += (ea.keruntutan || 0) + (ea.kebenaran || 0) + (ea.konteks_penjelasan || 0);
            });
            
            let isApproved = 'pending';
            if (slEssayAns.length > 0) {
              const hasReject = slEssayAns.some((ea: any) => ea.is_approved_by_teacher === 0 || ea.is_approved_by_teacher === false || ea.is_approved_by_teacher === 'false' || ea.is_approved_by_teacher === 'no' || ea.is_approved_by_teacher === 'reject');
              const hasPending = slEssayAns.some((ea: any) => ea.is_approved_by_teacher === null || ea.is_approved_by_teacher === 'pending');
              
              if (hasReject) {
                isApproved = 'reject';
              } else if (hasPending) {
                isApproved = 'pending';
              } else {
                isApproved = 'approve';
              }
            }

            const totalScore = (wondering?.score || 0) + exploringScore + explainScore;

            return {
              sub_lesson_id: sl.id,
              sub_lesson_name: sl.title,
              wondering_score: wondering?.score || 0,
              exploring_score: exploringScore,
              explain_score: explainScore,
              total_score: totalScore,
              status: isApproved,
            };
          });

        setData({
          user: user,
          studentCourse: studentCourse,
          currentBadge: currentBadge,
          progressPercentage,
          completedCount: completedSublessonsCount,
          totalCount: totalSublessonsCount,
          tableData
        });

      } catch (err: unknown) { 
        console.error("Gagal memuat data dari API:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, courseId]);

  return { data, loading, error };
};
