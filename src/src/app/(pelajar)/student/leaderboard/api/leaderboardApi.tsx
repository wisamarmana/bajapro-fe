import { UserData } from "@/src/types/users";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
        let studentsUrl = `${BASE_URL}/users?role_id=3`;
        if (classId) {
          studentsUrl += `&class_id=${classId}`;
        }
        const students = await handleFetch(studentsUrl);
        const courses = await handleFetch(
          `${BASE_URL}/t_student_course?course_id=${courseId}`
        );
        const badges = await handleFetch(`${BASE_URL}/badges`);

        // Fetch all scores for actual tooltips
        const wonderingScores = await handleFetch(`${BASE_URL}/t_wondering_score`);
        const codeAnswers = await handleFetch(`${BASE_URL}/t_code_answer`);
        const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer`);
        const codeQuestions = await handleFetch(`${BASE_URL}/code_question`);
        const essayQuestions = await handleFetch(`${BASE_URL}/essay_question`);

        // Fetch lessons and sublessons of this course to filter scores by course
        const lessons = await handleFetch(`${BASE_URL}/lessons?course_id=${courseId}`);
        const lessonIds = lessons.map((l: any) => Number(l.id));

        const subLessonsArrays = await Promise.all(
          lessonIds.map((lId: number) => handleFetch(`${BASE_URL}/sublessons?lesson_id=${lId}`))
        );
        const subLessons = subLessonsArrays.flat();
        const subLessonIds = subLessons.map((sl: any) => Number(sl.id));

        // Get code questions for these sublessons
        const courseCodeQuestions = codeQuestions.filter((cq: any) => subLessonIds.includes(Number(cq.sub_lesson_id)));
        const courseCodeQuestionIds = courseCodeQuestions.map((cq: any) => Number(cq.id));

        // Get essay questions for these code questions
        const courseEssayQuestions = essayQuestions.filter((eq: any) => {
          if (eq.sub_lesson_id) {
            return subLessonIds.includes(Number(eq.sub_lesson_id));
          }
          return courseCodeQuestionIds.includes(Number(eq.code_question_id));
        });
        const courseEssayQuestionIds = courseEssayQuestions.map((eq: any) => Number(eq.id));
    
        const studentsCourses = students.map((student: UserData) => {
          const matchedCourse = courses.find(
            (course: any) => course.student_id == student.id
          );

          // Calculate reading score (wondering)
          const stdWondering = wonderingScores.filter(
            (w: any) => (w.userId == student.id || w.user_id == student.id) && subLessonIds.includes(Number(w.sub_lesson_id))
          );
          const readingScore = stdWondering.reduce((acc: number, curr: any) => acc + (curr.score || curr.wondering_score || 0), 0);

          // Calculate coding score (exploring)
          const stdCodeAnswers = codeAnswers.filter(
            (c: any) => (c.userId == student.id || c.user_id == student.id) && courseCodeQuestionIds.includes(Number(c.code_question_id))
          );
          const codingScore = stdCodeAnswers.reduce((acc: number, curr: any) => acc + (curr.exploringScore || curr.exploring_score || 0), 0);

          // Calculate essay score (explain)
          const stdEssayAnswers = essayAnswers.filter(
            (e: any) => (e.userId == student.id || e.user_id == student.id) && courseEssayQuestionIds.includes(Number(e.essay_question_id))
          );
          let essayScore = 0;
          stdEssayAnswers.forEach((ea: any) => {
             essayScore += (ea.keruntutan || 0) + (ea.kebenaran || 0) + (ea.konteks_penjelasan || ea.konteksPenjelasan || 0);
          });

          const total = readingScore + codingScore + essayScore;
          const badge = matchedCourse?.badge_id ? badges.find((b: any) => b.id == matchedCourse.badge_id) : null;

          return {
            ...student,
            courseId: matchedCourse?.course_id || null,
            totalScore: total,
            badgeName: badge?.name || "No Badge",
            badgeImage: badge?.image || null,
            readingScore,
            codingScore,
            essayScore
          };
        });
    
        const filteredStudents = studentsCourses.filter(
          (student: any) => student.courseId !== null
        );
        
        // Sort by totalScore descending
        return filteredStudents.sort((a: any, b: any) => b.totalScore - a.totalScore);
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

