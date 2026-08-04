import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function OPTIONS() {
  return jsonResponse({}, 200);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');
  const searchParams = req.nextUrl.searchParams;

  try {
    // 1. Get Student Dashboard Data
    if (route === 'dashboard') {
      const studentIdParam = searchParams.get('studentId');
      const studentId = studentIdParam && studentIdParam !== 'undefined' ? Number(studentIdParam) : 0;
      
      if (isNaN(studentId)) {
        return jsonResponse({ error: 'Invalid student ID' }, 400);
      }

      // Batch all independent queries in parallel for maximum speed
      const [
        enrolledCourses,
        materialsCount,
        completedMaterials,
        allBadges,
        recentProgress,
        allStudentCourses,
        allStudents,
      ] = await Promise.all([
        prisma.studentCourse.findMany({
          where: { studentId },
          include: { course: true },
        }),
        prisma.subLesson.count({ where: { isActive: true } }),
        prisma.studentProgress.count({
          where: { userId: studentId, status: 'completed' }
        }),
        prisma.badge.findMany(),
        prisma.studentProgress.findMany({
          where: { userId: studentId, status: 'completed' },
          orderBy: { updatedAt: 'desc' },
          take: 2,
          include: {
            subLesson: {
              include: {
                 lesson: {
                   include: { course: true, level: true }
                 }
              }
            }
          }
        }),
        prisma.studentCourse.findMany({
          select: { studentId: true, totalScore: true }
        }),
        prisma.user.findMany({
          where: { roleId: 3 },
          select: { id: true, name: true }
        }),
      ]);

      // Build leaderboard from pre-fetched data
      const scoreMap = new Map<number, number>();
      allStudentCourses.forEach((sc: any) => {
        scoreMap.set(sc.studentId, (scoreMap.get(sc.studentId) || 0) + (sc.totalScore || 0));
      });

      const leaderboardRaw = allStudents
        .map((user: any) => ({
          id: user.id,
          name: user.name,
          score: scoreMap.get(user.id) || 0,
        }))
        .sort((a: any, b: any) => b.score - a.score);

      const top5Leaderboard = leaderboardRaw.slice(0, 5);

      const totalScore = enrolledCourses.reduce(
        (acc: number, curr: any) => acc + (curr.totalScore || 0),
        0
      );

      const overallProgress = materialsCount > 0 ? Math.round((completedMaterials / materialsCount) * 100) : 0;

      const userBadge = allBadges.find((b: any) => totalScore >= b.minScore && totalScore <= b.maxScore);
      const badgeName = userBadge ? userBadge.name : 'Beginner';
      const badgeImage = userBadge ? userBadge.image : null;

      const userRankIndex = leaderboardRaw.findIndex((u: any) => u.id === studentId);
      const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';

      // Batch progress queries for all enrolled courses at once (eliminates N+1)
      const courseIds = enrolledCourses.map((ec: any) => ec.courseId);
      
      const [allLessonsForCourses, allProgressForCourses] = await Promise.all([
        prisma.lesson.findMany({
          where: { courseId: { in: courseIds }, isActive: true },
          include: { subLessons: { where: { isActive: true }, select: { id: true } } }
        }),
        prisma.studentProgress.findMany({
          where: { userId: studentId, courseId: { in: courseIds }, status: 'completed' }
        })
      ]);

      const lessonHistory = enrolledCourses.map((ec: any) => {
        const courseLessons = allLessonsForCourses.filter((l: any) => l.courseId === ec.courseId);
        const totalCourseSublessons = courseLessons.reduce((acc: number, l: any) => acc + l.subLessons.length, 0);
        const completedCourseSublessons = allProgressForCourses.filter(
          (p: any) => p.courseId === ec.courseId
        ).length;
        const progressPercent = totalCourseSublessons > 0 ? Math.round((completedCourseSublessons / totalCourseSublessons) * 100) : 0;
        
        return {
          id: ec.id,
          student_id: ec.studentId,
          courseId: ec.courseId,
          course_id: ec.courseId,
          total_score: ec.totalScore,
          badge_id: ec.badgeId,
          isactive: ec.isActive,
          created_at: ec.createdAt,
          updated_at: ec.updatedAt,
          course: ec.course,
          progressPercent: progressPercent,
        };
      });

      return jsonResponse({
        enrolledCount: enrolledCourses.length,
        materialsTotal: materialsCount, // Note: This is actually sublessons count now
        materialsCompleted: completedMaterials,
        overallProgress: overallProgress,
        latestProgress: recentProgress,
        lessonHistory,
        achievement: {
          badge: badgeName,
          badgeImage: badgeImage,
          rank: userRank,
          totalScore,
        },
        top5Leaderboard,
      });
    }

    // 2. Get All Available Courses
    if (route === 'courses') {
      const courses = await prisma.course.findMany({
        where: { isActive: true },
        include: {
          lessons: {
            where: { isActive: true },
            include: {
              subLessons: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      const response = courses.map((course: any) => {
        const lessonsCount = course.lessons.length;
        const subLessonsCount = course.lessons.reduce(
          (acc: number, l: any) => acc + l.subLessons.length,
          0
        );

        return {
          id: course.id,
          course_name: course.courseName,
          description: course.description,
          img_thumbnail: course.imgThumbnail,
          published: course.published,
          isactive: course.isActive,
          created_at: course.createdAt,
          updated_at: course.updatedAt,
          lessonCount: lessonsCount,
          subLessonCount: subLessonsCount,
        };
      });

      return jsonResponse(response);
    }

    // 3. Get Course Detail with Levels
    if (route.startsWith('courses/')) {
      const courseId = Number(route.split('/')[1] || '0');

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return jsonResponse({ error: 'Course not found' }, 404);
      }

      const levels = await prisma.level.findMany({
        where: { isActive: true },
      });

      const lessons = await prisma.lesson.findMany({
        where: { courseId, isActive: true },
        orderBy: { position: 'asc' },
        include: {
          subLessons: {
            where: { isActive: true },
            orderBy: { orderPosition: 'asc' },
          },
        },
      });

      const levelsWithStats = levels.map((lvl: any) => {
        const lvlLessons = lessons.filter((l: any) => l.levelId === lvl.id);
        const subLessonsCount = lvlLessons.reduce(
          (acc: number, l: any) => acc + l.subLessons.length,
          0
        );

        return {
          id: lvl.id,
          level_name: lvl.levelName,
          description: lvl.description,
          isactive: lvl.isActive,
          created_at: lvl.createdAt,
          updated_at: lvl.updatedAt,
          lessonCount: lvlLessons.length,
          subLessonCount: subLessonsCount,
          isLocked: false,
        };
      });

      return jsonResponse({
        id: course.id,
        course_name: course.courseName,
        description: course.description,
        img_thumbnail: course.imgThumbnail,
        published: course.published,
        isactive: course.isActive,
        created_at: course.createdAt,
        updated_at: course.updatedAt,
        levels: levelsWithStats,
      });
    }

    // 4. Check Enrollment / Get Student Course Progress
    if (route === 'enrollment' || route === 'course-progress') {
      const sIdParam = searchParams.get('studentId');
      const studentId = sIdParam && sIdParam !== 'undefined' ? Number(sIdParam) : 0;
      const courseId = Number(searchParams.get('courseId') || '0');

      const enrollment = await prisma.studentCourse.findFirst({
        where: { studentId, courseId },
        include: { badge: true },
      });

      if (!enrollment) {
        return jsonResponse(null);
      }

      let badge = enrollment.badge;
      if (!badge) {
        const badges = await prisma.badge.findMany();
        badge =
          badges.find(
            (b: any) =>
              enrollment.totalScore >= b.minScore &&
              enrollment.totalScore <= b.maxScore
          ) || null;
      }

      return jsonResponse({
        id: enrollment.id,
        student_id: enrollment.studentId,
        course_id: enrollment.courseId,
        total_score: enrollment.totalScore,
        badge_id: enrollment.badgeId,
        isactive: enrollment.isActive,
        created_at: enrollment.createdAt,
        updated_at: enrollment.updatedAt,
        badge: badge
          ? {
              id: badge.id,
              name: badge.name,
              image: badge.image,
              min_score: badge.minScore,
              max_score: badge.maxScore,
              isactive: badge.isActive,
              created_at: badge.createdAt,
              updated_at: badge.updatedAt,
            }
          : null,
      });
    }

    // 5. Get Lessons, Sublessons, Materials, and Questions for Course & Level
    if (route === 'materials') {
      const courseId = Number(searchParams.get('courseId') || '0');
      const levelId = Number(searchParams.get('levelId') || '0');

      const lessons = await prisma.lesson.findMany({
        where: { courseId, levelId, isActive: true },
        orderBy: { position: 'asc' },
        include: {
          subLessons: {
            where: { isActive: true },
            orderBy: { orderPosition: 'asc' },
            include: {
              materials: {
                where: { isActive: true },
                orderBy: { contentPosition: 'asc' },
              },
              codeQuestions: {
                where: { isActive: true },
              },
            },
          },
        },
      });

      const allEssayQuestions = await prisma.essayQuestion.findMany({
        where: { isActive: true },
      });

      const response = lessons.map((lesson: any) => {
        const sublessonsData = lesson.subLessons.map((sl: any) => {
          const materialsData = sl.materials.map((m: any) => ({
            id: m.id,
            sub_lesson_id: m.subLessonId,
            title: m.title,
            materials: m.materials,
            url_video: m.urlVideo,
            content_position: m.contentPosition,
            prompt_lim: m.promptLim,
            published: m.published,
            isactive: m.isActive,
            created_at: m.createdAt,
            updated_at: m.updatedAt,
          }));

          const subLessonCodeQuestion = sl.codeQuestions[0] || null;

          const subLessonEssayQuestions = allEssayQuestions
            .filter((eq: any) => {
              if (eq.subLessonId) {
                return eq.subLessonId === sl.id;
              }
              return (
                subLessonCodeQuestion &&
                eq.codeQuestionId === subLessonCodeQuestion.id
              );
            })
            .map((eq: any) => ({
              id: eq.id,
              sub_lesson_id: eq.subLessonId,
              code_question_id: eq.codeQuestionId,
              essay_question: eq.essayQuestion,
              answer: eq.answer,
              answer_2: eq.answer2,
              answer_3: eq.answer3,
              answer_4: eq.answer4,
              isactive: eq.isActive,
              created_at: eq.createdAt,
              updated_at: eq.updatedAt,
            }));

          return {
            id: sl.id,
            lesson_id: sl.lessonId,
            title: sl.title,
            order_position: sl.orderPosition,
            isactive: sl.isActive,
            created_at: sl.createdAt,
            updated_at: sl.updatedAt,
            materials: materialsData,
            codeQuestion: subLessonCodeQuestion
              ? {
                  id: subLessonCodeQuestion.id,
                  sub_lesson_id: subLessonCodeQuestion.subLessonId,
                  code_question: subLessonCodeQuestion.codeQuestion,
                  image: subLessonCodeQuestion.image,
                  score: subLessonCodeQuestion.score,
                  hint: subLessonCodeQuestion.hint,
                  isactive: subLessonCodeQuestion.isActive,
                  created_at: subLessonCodeQuestion.createdAt,
                  updated_at: subLessonCodeQuestion.updatedAt,
                }
              : null,
            essayQuestions: subLessonEssayQuestions,
          };
        });

        return {
          id: lesson.id,
          course_id: lesson.courseId,
          level_id: lesson.levelId,
          title: lesson.title,
          description: lesson.description,
          position: lesson.position,
          img_thumbnail: lesson.imgThumbnail,
          published: lesson.published,
          isactive: lesson.isActive,
          created_at: lesson.createdAt,
          updated_at: lesson.updatedAt,
          sublessons: sublessonsData,
        };
      });

      return jsonResponse(response);
    }

    // 6. Get Student Progress list
    if (route === 'progress') {
      const sIdParam = searchParams.get('studentId');
      const studentId = sIdParam && sIdParam !== 'undefined' ? Number(sIdParam) : 0;
      const courseId = Number(searchParams.get('courseId') || '0');

      const progresses = await prisma.studentProgress.findMany({
        where: { userId: studentId, courseId },
      });

      return jsonResponse(
        progresses.map((p: any) => ({
          id: p.id,
          user_id: p.userId,
          course_id: p.courseId,
          sub_lesson_id: p.subLessonId,
          status: p.status,
          isactive: p.isActive,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
        }))
      );
    }

    // 7. Get Student Course Report Data
    if (route === 'course-report') {
      const sIdParam = searchParams.get('studentId');
      const studentId = sIdParam && sIdParam !== 'undefined' ? Number(sIdParam) : 0;
      const courseId = Number(searchParams.get('courseId') || '0');

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      const enrollment = await prisma.studentCourse.findFirst({
        where: { studentId, courseId },
      });

      let badge = null;
      if (enrollment) {
        if (enrollment.badgeId) {
          badge = await prisma.badge.findUnique({
            where: { id: enrollment.badgeId },
          });
        } else {
          const badges = await prisma.badge.findMany();
          badge =
            badges.find(
              (b: any) =>
                enrollment.totalScore >= b.minScore &&
                enrollment.totalScore <= b.maxScore
            ) || null;
        }
      }

      const lessons = await prisma.lesson.findMany({
        where: { courseId },
        orderBy: { id: 'asc' },
        include: {
          subLessons: {
            where: { isActive: true },
            orderBy: { id: 'asc' },
            include: {
              codeQuestions: true,
            },
          },
        },
      });

      const courseSubLessons = lessons.flatMap((l: any) => l.subLessons);

      const progressList = await prisma.studentProgress.findMany({
        where: { userId: studentId, courseId },
      });

      const codeAnswers = await prisma.codeAnswer.findMany({
        where: { userId: studentId },
      });

      const essayAnswers = await prisma.essayAnswer.findMany({
        where: { userId: studentId },
      });

      const essayQuestions = await prisma.essayQuestion.findMany({ orderBy: { id: 'asc' } });

      const reportData = courseSubLessons.map((sl: any) => {
        const progress = progressList.find((p: any) => p.subLessonId === sl.id);
        const cq = sl.codeQuestions[0] || null;
        const ca = cq ? codeAnswers.find((a: any) => a.codeQuestionId === cq.id) : null;

        const eqList = essayQuestions.filter((eq: any) => {
          if (eq.subLessonId) {
            return eq.subLessonId === sl.id;
          }
          return cq && eq.codeQuestionId === cq.id;
        });

        let essayScore = 0;
        let isAllApproved = true;
        let hasEssay = eqList.length > 0;
        let hasPending = false;
        let hasRejected = false;

        if (hasEssay) {
          eqList.forEach((eq: any) => {
            const ea = essayAnswers.find((a: any) => a.essayQuestionId === eq.id);
            if (ea) {
              const singleScore =
                (ea.konteksPenjelasan || 0) +
                (ea.keruntutan || 0) +
                (ea.kebenaran || 0);
              essayScore += singleScore;
              const approval = ea.isApprovedByTeacher;
              if (approval === 0) hasRejected = true;
              else if (approval !== 1) {
                isAllApproved = false;
                hasPending = true;
              }
            } else {
              isAllApproved = false;
              hasPending = true;
            }
          });
        }

        const readScore = progress && progress.status === 'completed' ? 10 : 0;
        const codingScore = ca ? ca.exploringScore : 0;
        const totalScore = readScore + codingScore + essayScore;

        let status = 'Pending';
        if (progress && progress.status === 'completed') {
          if (hasEssay) {
            if (hasRejected) status = 'Rejected';
            else if (hasPending) status = 'Pending';
            else status = 'Approve';
          } else {
            status = 'Approve';
          }
        }

        return {
          sublesson: {
            id: sl.id,
            lesson_id: sl.lessonId,
            title: sl.title,
            order_position: sl.orderPosition,
            isactive: sl.isActive,
            created_at: sl.createdAt,
            updated_at: sl.updatedAt,
          },
          readScore,
          codingScore,
          essayScore,
          totalScore,
          status,
        };
      });

      const finishedTests = progressList.filter(
        (p: any) => p.status === 'completed'
      ).length;
      const totalTests = courseSubLessons.length;
      const progressPercent =
        totalTests > 0 ? Math.round((finishedTests / totalTests) * 100) : 0;

      return jsonResponse({
        course: course
          ? {
              id: course.id,
              course_name: course.courseName,
              description: course.description,
              img_thumbnail: course.imgThumbnail,
              published: course.published,
              isactive: course.isActive,
            }
          : null,
        studentCourse: enrollment
          ? {
              id: enrollment.id,
              student_id: enrollment.studentId,
              course_id: enrollment.courseId,
              total_score: enrollment.totalScore,
              badge_id: enrollment.badgeId,
              isactive: enrollment.isActive,
            }
          : null,
        badge: badge
          ? {
              id: badge.id,
              name: badge.name,
              image: badge.image,
              min_score: badge.minScore,
              max_score: badge.maxScore,
              isactive: badge.isActive,
            }
          : null,
        reportData,
        finishedTests,
        totalTests,
        progressPercent,
      });
    }

    // 8. Get Student Sub Lesson Report Detail
    if (route === 'sublesson-report') {
      const sIdParam = searchParams.get('studentId');
      const studentId = sIdParam && sIdParam !== 'undefined' ? Number(sIdParam) : 0;
      const courseId = Number(searchParams.get('courseId') || '0');
      const subLessonId = Number(searchParams.get('subLessonId') || '0');

      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      const sublesson = await prisma.subLesson.findUnique({
        where: { id: subLessonId },
      });

      const progress = await prisma.studentProgress.findFirst({
        where: { userId: studentId, courseId, subLessonId },
      });

      // Code Question & Answer
      const codeQuestion = await prisma.codeQuestion.findFirst({
        where: { subLessonId },
      });

      let codeAnswer = null;
      let codeLogs: any[] = [];
      if (codeQuestion) {
        codeAnswer = await prisma.codeAnswer.findFirst({
          where: { userId: studentId, codeQuestionId: codeQuestion.id },
        });
        codeLogs = await prisma.codeHistoryLog.findMany({
          where: { userId: studentId, codeQuestionId: codeQuestion.id },
        });
      }

      // Essay Questions & Answers
      const allEssayQuestions = await prisma.essayQuestion.findMany();
      const essayQuestions = allEssayQuestions.filter((eq: any) => {
        if (eq.subLessonId) {
          return eq.subLessonId === subLessonId;
        }
        return codeQuestion && eq.codeQuestionId === codeQuestion.id;
      });

      const allEssayAnswers = await prisma.essayAnswer.findMany({
        where: { userId: studentId },
      });

      const essayDetails = essayQuestions.map((eq: any) => {
        const ea = allEssayAnswers.find((a: any) => a.essayQuestionId === eq.id);
        const score = ea
          ? (ea.konteksPenjelasan || 0) +
            (ea.keruntutan || 0) +
            (ea.kebenaran || 0)
          : 0;

        return {
          question: {
            id: eq.id,
            sub_lesson_id: eq.subLessonId,
            code_question_id: eq.codeQuestionId,
            essay_question: eq.essayQuestion,
            answer: eq.answer,
            answer_2: eq.answer2,
            answer_3: eq.answer3,
            answer_4: eq.answer4,
            isactive: eq.isActive,
          },
          answer: ea
            ? {
                id: ea.id,
                user_id: ea.userId,
                essay_question_id: ea.essayQuestionId,
                answer: ea.answer,
                konteks_penjelasan: ea.konteksPenjelasan,
                keruntutan: ea.keruntutan,
                kebenaran: ea.kebenaran,
                teacher_notes: ea.teacherNotes,
                is_approved_by_teacher: ea.isApprovedByTeacher,
                isactive: ea.isActive,
              }
            : null,
          score,
        };
      });

      let essayTotalScore = 0;
      let isAllApproved = true;
      let hasEssay = essayQuestions.length > 0;
      let hasPending = false;
      let hasRejected = false;

      if (hasEssay) {
        essayDetails.forEach((ed: any) => {
          essayTotalScore += ed.score;
          if (!ed.answer) {
            isAllApproved = false;
            hasPending = true;
          } else {
            const approval = ed.answer.is_approved_by_teacher;
            if (approval === 0) hasRejected = true;
            else if (approval !== 1) {
              isAllApproved = false;
              hasPending = true;
            }
          }
        });
      }

      const readScore = progress && progress.status === 'completed' ? 10 : 0;
      const codingScore = codeAnswer ? codeAnswer.exploringScore : 0;
      const totalScore = readScore + codingScore + essayTotalScore;

      let status = 'Pending';
      if (progress && progress.status === 'completed') {
        if (hasEssay) {
          if (hasRejected) status = 'Rejected';
          else if (hasPending) status = 'Pending';
          else status = 'Approve';
        } else {
          status = 'Approve';
        }
      }

      const user = await prisma.user.findUnique({
        where: { id: studentId },
      });

      return jsonResponse({
        course: course
          ? {
              id: course.id,
              course_name: course.courseName,
              description: course.description,
              img_thumbnail: course.imgThumbnail,
            }
          : null,
        sublesson: sublesson
          ? {
              id: sublesson.id,
              lesson_id: sublesson.lessonId,
              title: sublesson.title,
            }
          : null,
        progress: progress
          ? {
              id: progress.id,
              status: progress.status,
            }
          : null,
        status,
        readScore,
        codingScore,
        essayScore: essayTotalScore,
        totalScore,
        codeQuestion: codeQuestion
          ? {
              id: codeQuestion.id,
              code_question: codeQuestion.codeQuestion,
            }
          : null,
        codeAnswer: codeAnswer
          ? {
              id: codeAnswer.id,
              is_code_right: codeAnswer.isCodeRight,
              exploring_score: codeAnswer.exploringScore,
            }
          : null,
        codeLogs: codeLogs.map((cl: any) => ({
          id: cl.id,
          message: cl.message,
          time_count: cl.timeCount,
          is_error: cl.isError,
        })),
        essayDetails,
        user: user
          ? {
              id: user.id,
              class_id: user.classId,
              name: user.name,
            }
          : null,
      });
    }

    // 9. Get Student Profile
    if (route === 'profile') {
      const sIdParam = searchParams.get('studentId');
      const studentId = sIdParam && sIdParam !== 'undefined' ? Number(sIdParam) : 0;

      const user = await prisma.user.findUnique({
        where: { id: studentId },
      });

      if (!user) {
        return jsonResponse(null, 404);
      }

      let classData = null;
      if (user.classId) {
        classData = await prisma.class.findUnique({
          where: { id: user.classId },
        });
      }

      const enrolledCourses = await prisma.studentCourse.findMany({
        where: { studentId },
      });

      const allBadges = await prisma.badge.findMany();
      let totalScore = 0;
      let earnedBadges: any[] = [];

      enrolledCourses.forEach((ec: any) => {
        totalScore += ec.totalScore || 0;
        let b = null;
        if (ec.badgeId) {
          b = allBadges.find((ab: any) => ab.id === ec.badgeId);
        } else {
          b = allBadges.find(
            (ab: any) => ec.totalScore >= ab.minScore && ec.totalScore <= ab.maxScore
          );
        }
        if (b && !earnedBadges.some((eb: any) => eb.id === b.id)) {
          earnedBadges.push({
            id: b.id,
            name: b.name,
            image: b.image,
            min_score: b.minScore,
            max_score: b.maxScore,
          });
        }
      });

      const progressList = await prisma.studentProgress.findMany({
        where: { userId: studentId },
      });
      const completedLessons = progressList.filter(
        (p: any) => p.status === 'completed'
      ).length;

      return jsonResponse({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          class_id: user.classId,
          instansi_sekolah: user.instansiSekolah,
          is_approved_by_admin: user.isApprovedByAdmin,
        },
        classData: classData
          ? {
              id: classData.id,
              class_name: classData.className,
              school_name: classData.schoolName,
              class_code: classData.classCode,
            }
          : null,
        stats: {
          totalCourses: enrolledCourses.length,
          totalScore,
          completedLessons,
          badges: earnedBadges,
        },
      });
    }

    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error('Error handling GET:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');

  try {
    const body = await req.json();

    // 1. Enroll Course
    if (route === 'enrollment') {
      const { student_id, course_id } = body;
      const studentId = Number(student_id);
      const courseId = Number(course_id);

      const existing = await prisma.studentCourse.findFirst({
        where: { studentId, courseId },
      });

      if (existing) {
        return jsonResponse({
          id: existing.id,
          student_id: existing.studentId,
          course_id: existing.courseId,
          total_score: existing.totalScore,
          badge_id: existing.badgeId,
        });
      }

      const created = await prisma.studentCourse.create({
        data: {
          studentId,
          courseId,
          totalScore: 0,
          badgeId: null,
          isActive: true,
        },
      });

      return jsonResponse({
        id: created.id,
        student_id: created.studentId,
        course_id: created.courseId,
        total_score: created.totalScore,
        badge_id: created.badgeId,
      });
    }

    // 2. Update Progress (Create or patch)
    if (route === 'progress') {
      const { user_id, course_id, sub_lesson_id, status } = body;
      const studentId = Number(user_id);
      const courseId = Number(course_id);
      const subLessonId = Number(sub_lesson_id);

      const existing = await prisma.studentProgress.findFirst({
        where: { userId: studentId, courseId, subLessonId },
      });

      let updatedOrCreated;
      if (existing) {
        updatedOrCreated = await prisma.studentProgress.update({
          where: { id: existing.id },
          data: {
            status: status || 'completed',
          },
        });
      } else {
        updatedOrCreated = await prisma.studentProgress.create({
          data: {
            userId: studentId,
            courseId,
            subLessonId,
            status: status || 'completed',
            isActive: true,
          },
        });
      }

      if (updatedOrCreated.status === 'completed') {
        const ws = await prisma.wonderingScore.findFirst({
          where: { userId: studentId, subLessonId },
        });
        if (!ws) {
          await prisma.wonderingScore.create({
            data: { userId: studentId, subLessonId, score: 10, isActive: true },
          });
        } else {
          await prisma.wonderingScore.update({
            where: { id: ws.id },
            data: { score: 10 },
          });
        }
      }

      // Recalculate Student Course Total Score
      const completedProgress = await prisma.studentProgress.findMany({
        where: { userId: studentId, courseId, status: 'completed' },
      });
      const readScore = completedProgress.length * 10;

      const studentCodeAnswers = await prisma.codeAnswer.findMany({
        where: { userId: studentId },
      });
      const codingScore = studentCodeAnswers.reduce((acc: number, curr: any) => acc + (curr.exploringScore || 0), 0);

      const studentEssayAnswers = await prisma.essayAnswer.findMany({
        where: { userId: studentId },
      });
      const essayScore = studentEssayAnswers.reduce((acc: number, curr: any) => {
        return acc + (curr.konteksPenjelasan || 0) + (curr.keruntutan || 0) + (curr.kebenaran || 0);
      }, 0);

      const newTotalScore = readScore + codingScore + essayScore;

      await prisma.studentCourse.updateMany({
        where: { studentId, courseId },
        data: {
          totalScore: newTotalScore,
        },
      });

      return jsonResponse({
        id: updatedOrCreated.id,
        user_id: updatedOrCreated.userId,
        course_id: updatedOrCreated.courseId,
        sub_lesson_id: updatedOrCreated.subLessonId,
        status: updatedOrCreated.status,
      });
    }

    // 3. Submit Practice Answers
    if (route === 'submit-practice') {
      const {
        studentId: studentIdRaw,
        courseId: courseIdRaw,
        subLessonId: subLessonIdRaw,
        codeQuestionId: codeQuestionIdRaw,
        codeAnswer,
        essayAnswers,
        scoreToAdd,
      } = body;

      const studentId = Number(studentIdRaw);
      const courseId = Number(courseIdRaw);
      const subLessonId = Number(subLessonIdRaw);
      const codeQuestionId = codeQuestionIdRaw ? Number(codeQuestionIdRaw) : null;

      // 3.1. Save Code Answer (if any)
      if (codeQuestionId) {
        const existingCodeAnswer = await prisma.codeAnswer.findFirst({
          where: { userId: studentId, codeQuestionId },
        });

        if (existingCodeAnswer) {
          await prisma.codeAnswer.update({
            where: { id: existingCodeAnswer.id },
            data: {
              isCodeRight: true,
              exploringScore: 30,
            },
          });
        } else {
          await prisma.codeAnswer.create({
            data: {
              userId: studentId,
              codeQuestionId,
              isCodeRight: true,
              exploringScore: 30,
              isActive: true,
            },
          });
        }

        // Add history log
        await prisma.codeHistoryLog.create({
          data: {
            userId: studentId,
            codeQuestionId,
            timeCount: 30,
            message: 'Build successful! All tests passed.',
            isError: false,
            isActive: true,
          },
        });
      }

      // 3.2. Save Essay Answers
      if (essayAnswers && Array.isArray(essayAnswers) && essayAnswers.length > 0) {
        
        for (let i = 0; i < essayAnswers.length; i++) {
          const essay = essayAnswers[i];
          const essayQuestionId = Number(essay.essayQuestionId);
          
          let aiScore = 20; // Fallback score

          try {
            // Get the correct answers from DB
            const dbQuestion = await prisma.essayQuestion.findUnique({
              where: { id: essayQuestionId }
            });

            if (dbQuestion && essay.answer) {
              const formData = new URLSearchParams();
              formData.append('esay_question', dbQuestion.essayQuestion || '');
              formData.append('esay_answer', dbQuestion.answer || '');
              formData.append('esay_answer2', dbQuestion.answer2 || '');
              formData.append('esay_answer3', dbQuestion.answer3 || '');
              formData.append('esay_answer4', dbQuestion.answer4 || '');
              formData.append('user_answer', essay.answer);

              // const compilerBaseUrl = process.env.NODE_ENV === 'production'
              //     ? process.env.COMPILER_URL
              //     : 'http://labai.polinema.ac.id:90/online-compiler';

              const compilerBaseUrl = process.env.NODE_ENV === 'production'
       ? 'http://192.168.60.92:8000'
       : 'http://labai.polinema.ac.id:90/online-compiler';

              const res = await fetch(`${compilerBaseUrl}/compiler/generate/grade`, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              });

              if (res.ok) {
                const json = await res.json();
                if (json && typeof json.output === 'number') {
                  aiScore = json.output;
                }
              }
            }
          } catch (error) {
            console.error(`Failed to grade essay ${essayQuestionId} using AI:`, error);
          }

          let kp = 0, kr = 0, kb = 0;
          
          if (i === 0) kp = aiScore;
          else if (i === 1) kr = aiScore;
          else if (i === 2) kb = aiScore;
          else {
            // Just map to kp if more than 3
            kp = aiScore;
          }

          const userObj = await prisma.user.findUnique({ where: { id: Number(studentId) } });
          const hasClass = !!userObj?.classId;
          const approvalStatus = hasClass ? null : 1;

          const existingEssayAnswer = await prisma.essayAnswer.findFirst({
            where: { userId: Number(studentId), essayQuestionId },
          });

          if (existingEssayAnswer) {
            await prisma.essayAnswer.update({
              where: { id: existingEssayAnswer.id },
              data: {
                answer: essay.answer,
                konteksPenjelasan: kp,
                keruntutan: kr,
                kebenaran: kb,
                isApprovedByTeacher: approvalStatus,
              },
            });
          } else {
            await prisma.essayAnswer.create({
              data: {
                userId: Number(studentId),
                essayQuestionId,
                answer: essay.answer,
                konteksPenjelasan: kp,
                keruntutan: kr,
                kebenaran: kb,
                teacherNotes: '',
                isApprovedByTeacher: approvalStatus,
                isActive: true,
              },
            });
          }
        }
      }

      // 3.3. Update progress to completed
      const existingProgress = await prisma.studentProgress.findFirst({
        where: { userId: studentId, courseId, subLessonId },
      });

      if (existingProgress) {
        await prisma.studentProgress.update({
          where: { id: existingProgress.id },
          data: { status: 'completed' },
        });
      } else {
        await prisma.studentProgress.create({
          data: {
            userId: studentId,
            courseId,
            subLessonId,
            status: 'completed',
            isActive: true,
          },
        });
      }

      const ws = await prisma.wonderingScore.findFirst({
        where: { userId: studentId, subLessonId },
      });
      if (!ws) {
        await prisma.wonderingScore.create({
          data: { userId: studentId, subLessonId, score: 10, isActive: true },
        });
      } else {
        await prisma.wonderingScore.update({
          where: { id: ws.id },
          data: { score: 10 },
        });
      }

      // Recalculate Student Course Total Score
      // Gather all progress (completed) -> 10 pts each
      const completedProgress = await prisma.studentProgress.findMany({
        where: { userId: studentId, courseId, status: 'completed' },
      });
      const readScore = completedProgress.length * 10;

      // Gather all coding scores
      const studentCodeAnswers = await prisma.codeAnswer.findMany({
        where: { userId: studentId },
      });
      const codingScore = studentCodeAnswers.reduce((acc: number, curr: any) => acc + (curr.exploringScore || 0), 0);

      // Gather all essay scores
      const studentEssayAnswers = await prisma.essayAnswer.findMany({
        where: { userId: studentId },
      });
      const essayScore = studentEssayAnswers.reduce((acc: number, curr: any) => {
        return acc + (curr.konteksPenjelasan || 0) + (curr.keruntutan || 0) + (curr.kebenaran || 0);
      }, 0);

      const newTotalScore = readScore + codingScore + essayScore;

      // Update student course
      await prisma.studentCourse.updateMany({
        where: { studentId, courseId },
        data: {
          totalScore: newTotalScore,
        },
      });

      return jsonResponse({ success: true, newTotalScore });
    }

    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error('Error handling POST:', error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}
