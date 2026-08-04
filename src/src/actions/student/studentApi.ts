const getBaseUrl = (): string => {
  const url =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "/api";

  // Digunakan saat Server-Side Rendering.
  if (
    typeof window === "undefined" &&
    url.startsWith("/")
  ) {
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}${url}`;
    }

    return `http://localhost:${
      process.env.PORT || 3000
    }${url}`;
  }

  return url;
};

const BASE_URL = getBaseUrl();

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

const handleFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  try {
    const headers = new Headers(options.headers);

    // Jangan menambahkan Content-Type untuk FormData.
    if (
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }

    const response = await fetch(
      `${BASE_URL}${endpoint}`,
      {
        ...options,
        credentials: "include",
        headers,
      },
    );

    const contentType =
      response.headers.get("content-type");

    const isJSON =
      contentType?.includes("application/json");

    const result = isJSON
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof result === "object" &&
        result !== null
          ? result.message ||
            result.error ||
            `Server Error (${response.status})`
          : result ||
            `Server Error (${response.status})`;

      throw new Error(message);
    }

    // Untuk response kosong, misalnya HTTP 204.
    if (
      response.status === 204 ||
      result === ""
    ) {
      return null as T;
    }

    /*
     * Presenter GoFiber umumnya mengembalikan:
     *
     * {
     *   "success": true,
     *   "message": "...",
     *   "data": ...
     * }
     *
     * Ambil isi `data` secara otomatis.
     */
    if (
      typeof result === "object" &&
      result !== null &&
      "data" in result
    ) {
      return (
        result as ApiResponse<T>
      ).data as T;
    }

    // Tetap mendukung endpoint yang mengembalikan
    // response langsung tanpa presenter.
    return result as T;
  } catch (error) {
    console.error(
      `API Error [${endpoint}]:`,
      error,
    );

    throw error;
  }
};

// ======================================================
// Dashboard
// ======================================================

export const getStudentDashboardApi = () =>
  handleFetch<any>(
    "/student/dashboard",
  );

// ======================================================
// Courses
// ======================================================

export const getAllCoursesApi = () =>
  handleFetch<any[]>("/courses");

export const getCourseDetailApi = (
  courseId: number | string,
) =>
  handleFetch<any>(
    `/courses/${encodeURIComponent(
      String(courseId),
    )}`,
  );

// ======================================================
// Enrollment
// ======================================================

export const checkEnrollmentApi = async (
  courseId: number | string,
): Promise<boolean> => {
  const enrollment =
    await handleFetch<any | null>(
      `/student/enrollment?courseId=${encodeURIComponent(
        String(courseId),
      )}`,
    );

  return enrollment !== null;
};

export const getEnrollmentApi = (
  courseId: number | string,
) =>
  handleFetch<any | null>(
    `/student/enrollment?courseId=${encodeURIComponent(
      String(courseId),
    )}`,
  );

export const enrollCourseApi = (
  courseId: number | string,
) =>
  handleFetch<any>(
    `/student/${encodeURIComponent(
      String(courseId),
    )}/enroll`,
    {
      method: "POST",
    },
  );

// ======================================================
// Materials
// ======================================================

export const getCourseMaterialTreeApi = (
  courseId: number | string,
  levelId: number | string,
) => {
  const query = new URLSearchParams({
    courseId: String(courseId),
    levelId: String(levelId),
  });

  return handleFetch<any>(
    `/materials/tree?${query.toString()}`,
  );
};
// ======================================================
// Lesson Progress
// ======================================================

export const getStudentProgressApi = (
  courseId: number | string,
) => {
  const query = new URLSearchParams({
    courseId: String(courseId),
  });

  return handleFetch<any>(
    `/progress?${query.toString()}`,
  );
};

export const updateStudentProgressApi = (
  courseId: number | string,
  subLessonId: number | string,
  status = "completed",
) =>
  handleFetch<any>("/progress", {
    method: "POST",
    body: JSON.stringify({
      course_id: Number(courseId),
      sub_lesson_id: Number(
        subLessonId,
      ),
      status,
    }),
  });

// ======================================================
// Course Progress
// ======================================================

export const getStudentCourseProgressApi = (
  courseId: number | string,
) => {
  const query = new URLSearchParams({
    courseId: String(courseId),
  });

  return handleFetch<any | null>(
    `/student/course-progress?${query.toString()}`,
  );
};

// ======================================================
// Submit Practice
// ======================================================

export type SubmitPracticeParams = {
  courseId: number | string;
  subLessonId: number | string;
  codeQuestionId:
    | number
    | string
    | null;
  codeAnswer: string;
  essayAnswers: {
    essayQuestionId:
      | number
      | string;
    answer: string;
  }[];
  scoreToAdd: number;
};

export const submitPracticeAnswersApi = (
  params: SubmitPracticeParams,
) =>
  handleFetch<any>(
    "/submit-practice",
    {
      method: "POST",
      body: JSON.stringify({
        course_id: Number(
          params.courseId,
        ),
        sub_lesson_id: Number(
          params.subLessonId,
        ),
        code_question_id:
          params.codeQuestionId === null
            ? null
            : Number(
                params.codeQuestionId,
              ),
        code_answer:
          params.codeAnswer,
        essay_answers:
          params.essayAnswers.map(
            (item) => ({
              essay_question_id:
                Number(
                  item.essayQuestionId,
                ),
              answer: item.answer,
            }),
          ),
        score_to_add:
          params.scoreToAdd,
      }),
    },
  );

// ======================================================
// Course Report
// ======================================================

export const getStudentCourseReportApi = (
  courseId: number | string,
) => {
  const query = new URLSearchParams({
    courseId: String(courseId),
  });

  return handleFetch<any>(
    `/course-report?${query.toString()}`,
  );
};

export const getStudentSubLessonReportDetailApi =
  (
    courseId: number | string,
    subLessonId: number | string,
  ) => {
    const query =
      new URLSearchParams({
        courseId: String(courseId),
        subLessonId:
          String(subLessonId),
      });

    return handleFetch<any>(
      `/sublesson-report?${query.toString()}`,
    );
  };

// ======================================================
// Profile
// ======================================================

export const getStudentProfileApi = async () => {
  const response = await handleFetch<any>("/auth/profile");

  return response.data;
};