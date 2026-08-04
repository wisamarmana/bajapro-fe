import { DashboardStats, ActivityData, ApprovalItem, ActiveClass } from "@/src/types/dashboard";

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

const handleFetch = async (url: string, options?: RequestInit) => {
  try {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("token") || ""; 
    }
    const customOptions: RequestInit = {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}), 
      },
    };
    const response = await fetch(url, customOptions);
    if (!response.ok) {
      console.error(`Fetch Error: ${response.status}`);
      throw new Error(`Server Error (${response.status})`);
    }
    return response.json();
  } catch (err) {
    console.error("Network Error:", err);
    throw err;
  }
};

export const DashboardApi = {
  getAdminStats: async (): Promise<DashboardStats> => {
    const users = await handleFetch(`${BASE_URL}/users`);
    const classes = await handleFetch(`${BASE_URL}/class`);
    
    const teachers = users.filter((u: any) => u.role_id == 2);
    const students = users.filter((u: any) => u.role_id == 3);
    const pendingTeachers = teachers.filter((t: any) => t.is_approved_by_admin == 0);

    return {
      pendingApproval: pendingTeachers.length,
      totalClasses: classes.length,
      totalStudents: students.length,
      totalTeachers: teachers.length,
    };
  },

  getPengajarStats: async (teacherId: string | number): Promise<DashboardStats> => {
    const classes = await handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`);
    const classIds = classes.map((c: any) => c.id);
    const users = await handleFetch(`${BASE_URL}/users?role_id=3`);
    const myStudents = users.filter((u: any) => classIds.includes(u.class_id));
    const myStudentIds = myStudents.map((u: any) => u.id);
    
    const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer`);
    const myEssayAnswers = essayAnswers.filter((a: any) => myStudentIds.includes(a.user_id));
    
    const pendingTasks = myEssayAnswers.filter((a: any) => a.is_approved_by_teacher === null);
    const approvedTasks = myEssayAnswers.filter((a: any) => a.is_approved_by_teacher === 1);

    return {
      pendingApproval: pendingTasks.length,
      totalClasses: classes.length,
      totalStudents: myStudents.length,
      approvedItems: approvedTasks.length,
    };
  },

  getActivityData: async (role: "Admin" | "Pengajar", teacherId?: string | number, classId?: string, courseId?: string, startDate?: string, endDate?: string): Promise<ActivityData[]> => {
    let url = `${BASE_URL}/dashboard/activity?role=${role}`;
    if (teacherId) url += `&teacherId=${teacherId}`;
    if (classId && classId !== 'all') url += `&classId=${classId}`;
    if (courseId && courseId !== 'all') url += `&courseId=${courseId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    
    return handleFetch(url);
  },

  getPendingApprovals: async (role: "Admin" | "Pengajar", teacherId?: string | number): Promise<ApprovalItem[]> => {
    if (role === "Admin") {
      const users = await handleFetch(`${BASE_URL}/users?role_id=2`);
      const pendingTeachers = users.filter((t: any) => t.is_approved_by_admin === 0);
      return pendingTeachers.slice(0, 5).map((t: any) => ({
        id: t.id,
        name: t.name,
        context: t.instansi_sekolah || "Unknown School",
      }));
    } else {
      const essayAnswers = await handleFetch(`${BASE_URL}/t_essay_answer`);
      let users = await handleFetch(`${BASE_URL}/users?role_id=3`);
      
      if (teacherId) {
        const classes = await handleFetch(`${BASE_URL}/class?teacher_id=${teacherId}`);
        const classIds = classes.map((c: any) => c.id);
        users = users.filter((u: any) => classIds.includes(u.class_id));
      }
      
      const myStudentIds = users.map((u: any) => u.id);
      const pendingTasks = essayAnswers.filter((a: any) => a.is_approved_by_teacher === null && myStudentIds.includes(a.user_id));
      
      return pendingTasks.slice(0, 5).map((task: any) => {
        const student = users.find((u: any) => u.id == task.user_id);
        return {
          id: task.id,
          name: student?.name || "Unknown Student",
          context: `Tugas Essay #${task.essay_question_id}`,
        };
      });
    }
  },

  getActiveClasses: async (role: "Admin" | "Pengajar", teacherId?: string | number): Promise<ActiveClass[]> => {
    let classes = await handleFetch(`${BASE_URL}/class`);
    if (role === "Pengajar" && teacherId) {
      classes = classes.filter((c: any) => c.teacher_id == teacherId);
    }
    const users = await handleFetch(`${BASE_URL}/users`);
    
    const courses = await handleFetch(`${BASE_URL}/courses`);
    const studentCourses = await handleFetch(`${BASE_URL}/t_student_course`);
    const studentProgresses = await handleFetch(`${BASE_URL}/t_student_progress`);
    const subLessons = await handleFetch(`${BASE_URL}/sublessons`);
    const lessons = await handleFetch(`${BASE_URL}/lessons`);

    const activeClasses: ActiveClass[] = [];
    
    classes.forEach((c: any, index: number) => {
      const teacher = users.find((u: any) => u.id == c.teacher_id);
      const studentsInClass = users.filter((u: any) => u.class_id == c.id);
      const studentIds = studentsInClass.map((u: any) => u.id);
      
      if (studentsInClass.length === 0) {
        activeClasses.push({
          id: c.id,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: 0,
          progress: 0,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: "Belum Ada Course",
        } as any);
        return;
      }

      const classStudentCourses = studentCourses.filter((sc: any) => studentIds.includes(sc.student_id));
      const courseIdsInClass = Array.from(new Set(classStudentCourses.map((sc: any) => sc.course_id)));
      
      if (courseIdsInClass.length === 0) {
        activeClasses.push({
          id: c.id,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: studentsInClass.length,
          progress: 0,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: "Belum Ada Course",
        } as any);
        return;
      }

      courseIdsInClass.forEach((courseId) => {
        const course = courses.find((crs: any) => crs.id == courseId);
        const courseName = course ? course.course_name : "Unknown Course";
        
        const studentsInThisCourse = classStudentCourses.filter((sc: any) => sc.course_id == courseId);
        
        // Count total sublessons for this course
        const lessonsForCourse = lessons.filter((l: any) => l.course_id == courseId).map((l: any) => l.id);
        const courseSubLessons = subLessons.filter((sl: any) => lessonsForCourse.includes(sl.lesson_id));
        const totalSubLessonsInCourse = courseSubLessons.length || 1; // avoid division by zero
        
        // Count total completed sublessons for this class in this course
        const studentIdsInCourse = studentsInThisCourse.map((sc: any) => sc.student_id);
        const completedProgresses = studentProgresses.filter((p: any) => p.course_id == courseId && p.status === 'completed' && studentIdsInCourse.includes(p.user_id));
        
        const totalCompleted = completedProgresses.length;
        const maxPossibleCompleted = studentsInThisCourse.length * totalSubLessonsInCourse;
        
        let avgProgress = maxPossibleCompleted > 0 ? Math.floor((totalCompleted / maxPossibleCompleted) * 100) : 0;
        
        activeClasses.push({
          id: `${c.id}-${courseId}`,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: studentsInThisCourse.length,
          progress: avgProgress,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: courseName,
        } as any);
      });
    });

    return activeClasses;
  }
};
