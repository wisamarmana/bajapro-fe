import { NextResponse } from 'next/server';
import prisma from "@/src/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const teacherId = searchParams.get('teacherId');
  const classId = searchParams.get('classId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    if (role === 'Admin') {
      // Admin: Jumlah login harian
      let whereClause: any = {
        user: { roleId: 3 }
      };
      
      if (classId === 'none') {
        whereClause.user.classId = null;
      } else if (classId && classId !== 'all') {
        whereClause.user.classId = Number(classId);
      }
      
      if (startDate && endDate) {
        whereClause.loginTime = {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59Z')
        };
      }

      const logs = await prisma.userLoginLog.findMany({
        where: whereClause,
        orderBy: { loginTime: 'asc' },
      });

      // Group by day
      const grouped: Record<string, number> = {};
      logs.forEach(log => {
        const dateStr = log.loginTime.toISOString().split('T')[0];
        grouped[dateStr] = (grouped[dateStr] || 0) + 1;
      });

      const data = Object.keys(grouped).map(date => {
        const d = new Date(date);
        return {
          day: d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
          count: grouped[date]
        };
      });

      return NextResponse.json(data);
    } else {
      // Pengajar: Progress rata-rata pelajar per materi (sub lesson)
      // Filter course can be added but for simplicity let's just get progress
      const courseId = searchParams.get('courseId');
      
      let userWhere: any = { roleId: 3 };
      if (classId === 'none') {
        userWhere.classId = null;
      } else if (classId && classId !== 'all') {
        userWhere.classId = Number(classId);
      } else if (teacherId) {
        // Hanya kelas milik pengajar ini
        const teacherClasses = await prisma.class.findMany({
          where: { teacherId: Number(teacherId) }
        });
        userWhere.classId = { in: teacherClasses.map(c => c.id) };
      }

      const students = await prisma.user.findMany({
        where: userWhere,
        select: { id: true }
      });
      const studentIds = students.map(s => s.id);

      let subLessonWhere: any = {};
      if (courseId && courseId !== 'all') {
        subLessonWhere.lesson = { courseId: Number(courseId) };
      }

      const subLessons = await prisma.subLesson.findMany({
        where: subLessonWhere,
        include: { lesson: true },
        orderBy: [{ lesson: { position: 'asc' } }, { orderPosition: 'asc' }]
      });

      const progresses = await prisma.studentProgress.findMany({
        where: {
          userId: { in: studentIds },
          status: 'completed'
        }
      });

      const data = subLessons.map(sl => {
        // How many students completed this sub lesson?
        const completedCount = progresses.filter(p => p.subLessonId === sl.id).length;
        const totalStudents = studentIds.length || 1;
        const avg = Math.round((completedCount / totalStudents) * 100);

        return {
          day: sl.title.length > 15 ? sl.title.substring(0, 15) + '...' : sl.title, // Use day as the generic x-axis label for recharts
          count: avg
        };
      });

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Error fetching activity data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
