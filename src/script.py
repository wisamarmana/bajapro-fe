import sys

file_path = r'e:\bajapro-fe\src\src\actions\dashboard\dashboardApi.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = '''    const users = await handleFetch(${BASE_URL}/users);
    
    const activeClasses = classes.map((c: any, index: number) => {
      const teacher = users.find((u: any) => u.id == c.teacher_id);
      const students = users.filter((u: any) => u.class_id == c.id);
      const progress = Math.floor(Math.random() * 100);

      return {
        id: c.id,
        no: index + 1,
        className: c.class_name,
        teacherName: teacher?.name || "Unknown",
        studentCount: students.length,
        progress: progress,
        status: c.isactive ? "Aktif" : "Non-Aktif",
      };
    });'''

replacement = '''    const users = await handleFetch(${BASE_URL}/users);
    const courses = await handleFetch(${BASE_URL}/courses);
    const studentCourses = await handleFetch(${BASE_URL}/t_student_course);

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
        let totalScore = 0;
        studentsInThisCourse.forEach((sc: any) => {
          totalScore += sc.total_score || 0;
        });
        
        const maxScorePerStudent = 100;
        let avgProgress = studentsInThisCourse.length > 0 ? Math.min(100, Math.floor((totalScore / (studentsInThisCourse.length * maxScorePerStudent)) * 100)) : 0;
        
        activeClasses.push({
          id: ${c.id}-,
          no: activeClasses.length + 1,
          className: c.class_name,
          teacherName: teacher?.name || "Unknown",
          studentCount: studentsInThisCourse.length,
          progress: avgProgress,
          status: c.isactive ? "Aktif" : "Non-Aktif",
          courseName: courseName,
        } as any);
      });
    });'''

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('SUCCESS')
else:
    print('TARGET NOT FOUND')
