import { useState, useEffect } from 'react';
import { reportApi } from "@/src/actions/report/reportApi"; 
import { EssayAnswer, CodeHistoryLog } from "@/src/types/report";

export interface DetailAnswerData {
  essay: EssayAnswer | null;
  logs: CodeHistoryLog[];
  codeAnswer: any;
  user: any;
  sublesson: any;
  codeQuestion: any;
  wonderingScore: any;
  essayQuestions: any[];
  essayAnswers: any[];
}

export const useApproval = (userId?: string | number, subLessonId?: string | number) => {
  const [loading, setLoading] = useState<boolean>(!!(userId && subLessonId));
  const [data, setData] = useState<DetailAnswerData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !subLessonId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [
          codeQuestions, essayQuestionsList, essayAnswersList, 
          codeLogsList, codeAnswersList, user, sublessonRes, wonderingList
        ] = await Promise.all([
          reportApi.getCodeQuestions(),
          reportApi.getEssayQuestions(),
          reportApi.getEssayAnswers(userId),
          reportApi.getCodeLogs(userId, subLessonId),
          reportApi.getCodeAnswers(userId),
          reportApi.getUser(userId),
          reportApi.getSublesson(subLessonId).catch(() => null),
          reportApi.getWonderingScoreBySubLesson(userId, subLessonId).catch(() => [])
        ]);

        const codeQuestion = codeQuestions.find((cq: any) => cq.sub_lesson_id == subLessonId);
        
        let logs: CodeHistoryLog[] = [];
        let codeAnswer = null;
        let finalEssayQuestions: any[] = [];
        let finalEssayAnswers: any[] = [];

        if (codeQuestion) {
          finalEssayQuestions = essayQuestionsList.filter((eq: any) => eq.code_question_id == codeQuestion.id);
          finalEssayAnswers = essayAnswersList.filter((ea: any) => finalEssayQuestions.some(eq => eq.id == ea.essay_question_id));
          
          logs = codeLogsList || [];
          codeAnswer = codeAnswersList.find((ca: any) => ca.code_question_id == codeQuestion.id);
        }

        const logsData = codeQuestion ? await reportApi.getCodeLogs(userId, codeQuestion.id) : [];

        setData({ 
          essay: finalEssayAnswers.length > 0 ? finalEssayAnswers[0] : null, 
          logs: logsData || [],
          codeAnswer,
          codeQuestion,
          wonderingScore: wonderingList?.[0] || null,
          user,
          sublesson: sublessonRes,
          essayQuestions: finalEssayQuestions,
          essayAnswers: finalEssayAnswers
        });
      } catch (err: unknown) { 
        console.error("Gagal memuat data dari API:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat mengambil data");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [userId, subLessonId]);

  const updateGrade = async (essayId: string | number, payload: any) => {
    return reportApi.updateEssayGrade(essayId, payload);
  };

  const updateProgress = async (progressId: string | number, status: string) => {
    return reportApi.updateProgressStatus(progressId, status);
  };

  return { data, loading, error, updateGrade, updateProgress };
};
