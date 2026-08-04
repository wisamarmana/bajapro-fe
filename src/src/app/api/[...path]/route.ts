import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export const dynamic = 'force-dynamic';

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

// Map helpers to convert Prisma models to legacy snake_case format expected by frontend
function mapLevel(l: any) {
  return {
    id: l.id,
    level_name: l.levelName,
    deskripsi: l.description,
    description: l.description, // keep description just in case it's used elsewhere
    isactive: l.isActive,
  };
}

function mapCourse(c: any) {
  return {
    id: c.id,
    course_name: c.courseName,
    description: c.description,
    img_thumbnail: c.imgThumbnail,
    published: c.published,
    isactive: c.isActive,
  };
}

function mapLesson(l: any) {
  return {
    id: l.id,
    course_id: l.courseId,
    level_id: l.levelId,
    title: l.title,
    description: l.description,
    position: l.position,
    img_thumbnail: l.imgThumbnail,
    published: l.published,
    isactive: l.isActive,
  };
}

function mapSubLesson(sl: any) {
  return {
    id: sl.id,
    lesson_id: sl.lessonId,
    title: sl.title,
    order_position: sl.orderPosition,
    isactive: sl.isActive,
  };
}

function mapMaterial(m: any) {
  return {
    id: m.id,
    sub_lesson_id: m.subLessonId,
    title: m.title,
    materials: m.materials,
    url_video: m.urlVideo,
    content_position: m.contentPosition,
    prompt_lim: m.promptLim,
    published: m.published,
    isactive: m.isActive,
  };
}

function mapStudentCourse(sc: any) {
  return {
    id: sc.id,
    student_id: sc.studentId,
    course_id: sc.courseId,
    badge_id: sc.badgeId,
    total_score: sc.totalScore,
    isactive: sc.isActive,
  };
}

function mapStudentProgress(sp: any) {
  return {
    id: sp.id,
    user_id: sp.userId,
    course_id: sp.courseId,
    sub_lesson_id: sp.subLessonId,
    status: sp.status,
  };
}

function mapWonderingScore(ws: any) {
  return {
    id: ws.id,
    user_id: ws.userId,
    sub_lesson_id: ws.subLessonId,
    score: ws.score,
    wondering_score: ws.score,
  };
}

function mapCodeAnswer(ca: any) {
  return {
    id: ca.id,
    user_id: ca.userId,
    code_question_id: ca.codeQuestionId,
    source_code: ca.sourceCode,
    exploring_score: ca.exploringScore,
  };
}

function mapEssayAnswer(ea: any) {
  return {
    id: ea.id,
    user_id: ea.userId,
    essay_question_id: ea.essayQuestionId,
    answer: ea.answer,
    essay_answer: ea.answer,
    konteks_penjelasan: ea.konteksPenjelasan,
    keruntutan: ea.keruntutan,
    kebenaran: ea.kebenaran,
    is_approved_by_teacher: ea.isApprovedByTeacher,
    feedback_note: ea.teacherNotes,
    teacher_notes: ea.teacherNotes,
  };
}

function mapCodeQuestion(cq: any) {
  return {
    id: cq.id,
    sub_lesson_id: cq.subLessonId,
    code_question: cq.codeQuestion,
    score: cq.score,
    image: cq.image,
    hint: cq.hint,
    isactive: cq.isActive,
  };
}

function mapEssayQuestion(eq: any) {
  return {
    id: eq.id,
    sub_lesson_id: eq.subLessonId,
    code_question_id: eq.codeQuestionId,
    question: eq.essayQuestion,
    essay_question: eq.essayQuestion,
    answer: eq.answer,
    answer_2: eq.answer2,
    answer_3: eq.answer3,
    answer_4: eq.answer4,
    isactive: eq.isActive,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const route = path.join('/');
  const searchParams = req.nextUrl.searchParams;

  try {
    // 0. Levels
    if (route === 'levels') {
      const levels = await prisma.level.findMany({ orderBy: { id: 'asc' } });
      return jsonResponse(levels.map(mapLevel));
    }

    // 1. Courses
    if (route === 'courses') {
      const courses = await prisma.course.findMany({ orderBy: { id: 'asc' } });
      return jsonResponse(courses.map(mapCourse));
    }

    // 2. Lessons
    if (route === 'lessons') {
      const courseId = searchParams.get('course_id');
      const whereClause: any = {};
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      const lessons = await prisma.lesson.findMany({
        where: whereClause,
        orderBy: { position: 'asc' },
      });
      return jsonResponse(lessons.map(mapLesson));
    }

    // 3. Sublessons
    if (route === 'sublessons') {
      const lessonId = searchParams.get('lesson_id');
      const whereClause: any = {};
      if (lessonId) {
        whereClause.lessonId = Number(lessonId);
      }
      const sublessons = await prisma.subLesson.findMany({
        where: whereClause,
        orderBy: { orderPosition: 'asc' },
      });
      return jsonResponse(sublessons.map(mapSubLesson));
    }

    // 3.5 Materials
    if (route === 'materials') {
      const subLessonId = searchParams.get('sub_lesson_id');
      const whereClause: any = {};
      if (subLessonId) {
        whereClause.subLessonId = Number(subLessonId);
      }
      const materials = await prisma.material.findMany({
        where: whereClause,
        orderBy: { contentPosition: 'asc' },
      });
      return jsonResponse(materials.map(mapMaterial));
    }

    // 4. t_student_course
    if (route === 't_student_course') {
      const courseId = searchParams.get('course_id');
      const studentId = searchParams.get('student_id');
      const whereClause: any = {};
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      if (studentId) {
        whereClause.studentId = Number(studentId);
      }
      const items = await prisma.studentCourse.findMany({ where: whereClause });
      return jsonResponse(items.map(mapStudentCourse));
    }

    // 5. t_student_progress
    if (route === 't_student_progress') {
      const userId = searchParams.get('user_id');
      const courseId = searchParams.get('course_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      if (courseId) {
        whereClause.courseId = Number(courseId);
      }
      const items = await prisma.studentProgress.findMany({ where: whereClause });
      return jsonResponse(items.map(mapStudentProgress));
    }

    // 6. t_wondering_score
    if (route === 't_wondering_score') {
      const userId = searchParams.get('user_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      const items = await prisma.wonderingScore.findMany({ where: whereClause });
      return jsonResponse(items.map(mapWonderingScore));
    }

    // 7. t_code_answer
    if (route === 't_code_answer') {
      const userId = searchParams.get('user_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      const items = await prisma.codeAnswer.findMany({ where: whereClause });
      return jsonResponse(items.map(mapCodeAnswer));
    }

    // 8. t_essay_answer
    if (route === 't_essay_answer') {
      const userId = searchParams.get('user_id');
      const essayQuestionId = searchParams.get('essay_question_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      if (essayQuestionId) {
        whereClause.essayQuestionId = Number(essayQuestionId);
      }
      const items = await prisma.essayAnswer.findMany({ where: whereClause });
      return jsonResponse(items.map(mapEssayAnswer));
    }

    // 8.5 t_code_history_logs
    if (route === 't_code_history_logs') {
      const userId = searchParams.get('user_id');
      const codeQuestionId = searchParams.get('code_question_id');
      const whereClause: any = {};
      if (userId) {
        whereClause.userId = Number(userId);
      }
      if (codeQuestionId) {
        whereClause.codeQuestionId = Number(codeQuestionId);
      }
      const items = await prisma.codeHistoryLog.findMany({ where: whereClause });
      return jsonResponse(items.map((chl: any) => ({
        id: chl.id,
        user_id: chl.userId,
        code_question_id: chl.codeQuestionId,
        time_count: chl.timeCount,
        message: chl.message,
        is_error: chl.isError,
      })));
    }

    // 9. code_question
    if (route === 'code_question') {
      const subLessonId = searchParams.get('sub_lesson_id');
      const items = await prisma.codeQuestion.findMany({
        where: subLessonId ? { subLessonId: Number(subLessonId) } : {},
        orderBy: { id: 'asc' }
      });
      return jsonResponse(items.map(mapCodeQuestion));
    }

    // 10. essay_question
    if (route === 'essay_question') {
      const codeQuestionId = searchParams.get('code_question_id');
      if (codeQuestionId) {
        const items = await prisma.essayQuestion.findMany({ where: { codeQuestionId: Number(codeQuestionId) } });
        return jsonResponse(items.map(mapEssayQuestion));
      }
      const items = await prisma.essayQuestion.findMany();
      return jsonResponse(items.map(mapEssayQuestion));
    }

    // 11. Users
    if (route === 'users') {
      const classId = searchParams.get('class_id');
      const roleId = searchParams.get('role_id');
      const teacherId = searchParams.get('teacher_id');
      const whereClause: any = {};
      
      if (classId === 'null' || classId === 'none') {
        whereClause.classId = null;
      } else if (classId) {
        whereClause.classId = Number(classId);
      }
      
      if (roleId) {
        whereClause.roleId = Number(roleId);
      }
      
      if (teacherId) {
        // Teacher can see students in their classes, and themselves
        const teacherClasses = await prisma.class.findMany({ where: { teacherId: Number(teacherId) } });
        const classIds = teacherClasses.map((c: any) => c.id);
        
        whereClause.OR = [
          { id: Number(teacherId) }, // The teacher themselves
          { classId: { in: classIds } } // Students in their classes
        ];
      }

      const users = await prisma.user.findMany({ where: whereClause, include: { class: true, role: true }, orderBy: { id: 'asc' } });
      return jsonResponse(users.map((u: any) => ({
        id: u.id, name: u.name, email: u.email, role: u.role?.name || "", isactive: u.isActive ? 1 : 0,
        instansi_sekolah: u.instansiSekolah || null, nip: u.nip || null, class_name: u.class?.className || null, is_approved_by_admin: u.isApprovedByAdmin
      })));
    }

    // 12. Permissions
    if (route === 'permissions') {
      const name = searchParams.get('name');
      const whereClause: any = {};
      if (name) {
        whereClause.name = name;
      }
      const permissions = await prisma.permission.findMany({ 
        where: whereClause, 
        include: { roles: true },
        orderBy: { id: 'asc' } 
      });
      return jsonResponse(permissions.map((p: any) => ({
        ...p,
        role_ids: p.roles.map((r: any) => r.id)
      })));
    }

    // 13. Roles
    if (route === 'roles') {
      const roles = await prisma.role.findMany({ orderBy: { id: 'asc' } });
      return jsonResponse(roles);
    }

    // 14. Class
    if (route === 'class') {
      const teacherId = searchParams.get('teacher_id');
      const whereClause: any = {};
      if (teacherId) {
        whereClause.teacherId = Number(teacherId);
      }
      const classes = await prisma.class.findMany({ where: whereClause, orderBy: { id: 'asc' } });
      return jsonResponse(classes.map((c: any) => ({
        id: c.id, class_name: c.className, school_name: c.schoolName, class_code: c.classCode, teacher_id: c.teacherId
      })));
    }

    // -- Handle GET by ID for all resources --
    if (path.length === 2) {
      const resource = path[0];
      const id = Number(path[1]);
      
      if (!isNaN(id)) {
        if (resource === 'levels') {
          const item = await prisma.level.findUnique({ where: { id } });
          return item ? jsonResponse(mapLevel(item)) : jsonResponse({ error: "Not found" }, 404);
        }
        if (resource === 'courses') {
          const item = await prisma.course.findUnique({ where: { id } });
          return item ? jsonResponse(mapCourse(item)) : jsonResponse({ error: "Not found" }, 404);
        }
        if (resource === 'lessons') {
          const item = await prisma.lesson.findUnique({ where: { id } });
          return item ? jsonResponse(mapLesson(item)) : jsonResponse({ error: "Not found" }, 404);
        }
        if (resource === 'sublessons') {
          const item = await prisma.subLesson.findUnique({ where: { id } });
          return item ? jsonResponse(mapSubLesson(item)) : jsonResponse({ error: "Not found" }, 404);
        }
        if (resource === 'code_question') {
          const item = await prisma.codeQuestion.findUnique({ where: { id } });
          return item ? jsonResponse(mapCodeQuestion(item)) : jsonResponse({ error: "Not found" }, 404);
        }
        if (resource === 'essay_question') {
          const item = await prisma.essayQuestion.findUnique({ where: { id } });
          return item ? jsonResponse(mapEssayQuestion(item)) : jsonResponse({ error: "Not found" }, 404);
        }
      }
    }

    return jsonResponse({ error: `Route /api/${route} not found` }, 404);
  } catch (error: any) {
    console.error(`Error in GET /api/${route}:`, error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    if (path.length === 2) {
      const resource = path[0];
      const id = Number(path[1]);
      const body = await req.json();

      if (!isNaN(id)) {
        if (resource === 'levels') {
          const updated = await prisma.level.update({ where: { id }, data: { levelName: body.levelName || body.level_name, description: body.description, isActive: body.isactive === 'Aktif' || body.isactive === true || body.isActive === true || body.isActive === 'Aktif' } });
          return jsonResponse(mapLevel(updated));
        }
        if (resource === 'courses') {
          const updated = await prisma.course.update({ where: { id }, data: { courseName: body.course_name, description: body.description, imgThumbnail: body.img_thumbnail } });
          return jsonResponse(mapCourse(updated));
        }
        if (resource === 'lessons') {
          const updated = await prisma.lesson.update({ where: { id }, data: { title: body.title, description: body.description, levelId: body.level_id, position: body.position } });
          return jsonResponse(mapLesson(updated));
        }
        if (resource === 'sublessons') {
          const updated = await prisma.subLesson.update({ where: { id }, data: { title: body.title, orderPosition: body.order_position } });
          return jsonResponse(mapSubLesson(updated));
        }
        if (resource === 'materials') {
          const updated = await prisma.material.update({ where: { id }, data: { title: body.title, materials: body.materials || "", urlVideo: body.url_video, contentPosition: body.content_position } });
          return jsonResponse(mapMaterial(updated));
        }
        if (resource === 'code_question') {
          const updated = await prisma.codeQuestion.update({ where: { id }, data: { subLessonId: body.sub_lesson_id ? Number(body.sub_lesson_id) : undefined, codeQuestion: body.code_question, score: body.score } });
          return jsonResponse(mapCodeQuestion(updated));
        }
        if (resource === 'essay_question') {
          const updated = await prisma.essayQuestion.update({ where: { id }, data: { essayQuestion: body.question, answer: body.answer, answer2: body.answer_2 || null, answer3: body.answer_3 || null, answer4: body.answer_4 || null } });
          return jsonResponse(mapEssayQuestion(updated));
        }
        if (resource === 't_essay_answer') {
          const updated = await prisma.essayAnswer.update({
            where: { id },
            data: {
              ...(body.answer !== undefined && { answer: body.answer }),
              ...(body.konteks_penjelasan !== undefined && { konteksPenjelasan: body.konteks_penjelasan }),
              ...(body.keruntutan !== undefined && { keruntutan: body.keruntutan }),
              ...(body.kebenaran !== undefined && { kebenaran: body.kebenaran }),
              ...(body.is_approved_by_teacher !== undefined && { isApprovedByTeacher: body.is_approved_by_teacher }),
              ...(body.teacher_notes !== undefined && { teacherNotes: body.teacher_notes }),
            }
          });
          return jsonResponse(updated);
        }
        if (resource === 'permissions') {
          // Handle many-to-many role_ids update
          const updated = await prisma.permission.update({
            where: { id },
            data: {
              roles: {
                set: (body.role_ids || []).map((roleId: number) => ({ id: roleId }))
              }
            }
          });
          return jsonResponse(updated);
        }
      }
    }
    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error("PATCH Error:", error);
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
    if (route === 'levels') {
      const created = await prisma.level.create({ data: { levelName: body.levelName || body.level_name, description: body.description, isActive: true } });
      return jsonResponse(mapLevel(created));
    }
    if (route === 'courses') {
      const created = await prisma.course.create({ data: { courseName: body.course_name, description: body.description, imgThumbnail: body.img_thumbnail, published: 1, isActive: true } });
      return jsonResponse(mapCourse(created));
    }
    if (route === 'lessons') {
      const courseId = Number(body.course_id);
      const count = await prisma.lesson.count({ where: { courseId } });
      const created = await prisma.lesson.create({ data: { courseId, levelId: Number(body.level_id), title: body.title, description: body.description || "", position: body.position || count + 1, published: 1, isActive: true } });
      return jsonResponse(mapLesson(created));
    }
    if (route === 'sublessons') {
      const lessonId = Number(body.lesson_id);
      const count = await prisma.subLesson.count({ where: { lessonId } });
      const created = await prisma.subLesson.create({ data: { lessonId, title: body.title, orderPosition: body.order_position ? Number(body.order_position) : count + 1, isActive: true } });
      return jsonResponse(mapSubLesson(created));
    }
    if (route === 'materials') {
      const subLessonId = Number(body.sub_lesson_id);
      const created = await prisma.material.create({ data: { subLessonId, title: body.title, materials: body.materials || "", urlVideo: body.url_video, contentPosition: body.content_position ? Number(body.content_position) : 1, isActive: true } });
      return jsonResponse(mapMaterial(created));
    }
    if (route === 'code_question') {
      const created = await prisma.codeQuestion.create({ data: { subLessonId: Number(body.sub_lesson_id), codeQuestion: body.code_question || "", score: body.score ? Number(body.score) : 30, isActive: true } });
      return jsonResponse(mapCodeQuestion(created));
    }
    if (route === 'essay_question') {
      const created = await prisma.essayQuestion.create({ data: { codeQuestionId: body.code_question_id ? Number(body.code_question_id) : undefined, essayQuestion: body.question || "", answer: body.answer || "", answer2: body.answer_2 || body.answer_1 || null, answer3: body.answer_3 || body.answer_2 || null, answer4: body.answer_4 || body.answer_3 || null, isActive: true } });
      return jsonResponse(mapEssayQuestion(created));
    }
    if (route === 'users') {
      let roleId = 3; // Pelajar default
      if (body.role === 'Admin') roleId = 1;
      else if (body.role === 'Pengajar') roleId = 2;
      
      let classId = null;
      if (body.class_name) {
        const classObj = await prisma.class.findFirst({ where: { className: body.class_name } });
        if (classObj) classId = classObj.id;
      }

      const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
      if (existingUser) {
        return jsonResponse({ error: 'Email sudah terdaftar' }, 400);
      }

      const created = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          roleId: roleId,
          password: require('bcryptjs').hashSync(body.password || "password123", 10),
          instansiSekolah: body.instansi_sekolah || "",
          classId: classId,
          isActive: true,
        }
      });
      return jsonResponse(created);
    }
    if (route === 'class') {
      const created = await prisma.class.create({
        data: {
          className: body.class_name,
          schoolName: body.school_name,
          classCode: body.class_code,
          teacherId: body.teacher_id ? Number(body.teacher_id) : 1, // Fallback ke admin jika tidak ada
        }
      });
      return jsonResponse(created);
    }
    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error("API POST ERROR:", error);
    return jsonResponse({ error: error.message || 'Internal Server Error' }, 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  try {
    if (path.length === 2) {
      const resource = path[0];
      const id = Number(path[1]);
      const body = await req.json();

      if (!isNaN(id)) {
        if (resource === 'users') {
          const updated = await prisma.user.update({
            where: { id },
            data: {
              name: body.name,
              email: body.email,
              instansiSekolah: body.instansi_sekolah || null,
              nip: body.nip || null,
            }
          });
          return jsonResponse(updated);
        }

        if (resource === 't_essay_answer') {
          const updated = await prisma.essayAnswer.update({
            where: { id },
            data: {
              ...(body.answer !== undefined && { answer: body.answer }),
              ...(body.konteks_penjelasan !== undefined && { konteksPenjelasan: body.konteks_penjelasan }),
              ...(body.keruntutan !== undefined && { keruntutan: body.keruntutan }),
              ...(body.kebenaran !== undefined && { kebenaran: body.kebenaran }),
              ...(body.is_approved_by_teacher !== undefined && { isApprovedByTeacher: body.is_approved_by_teacher }),
              ...(body.teacher_notes !== undefined && { teacherNotes: body.teacher_notes }),
            }
          });
          return jsonResponse(updated);
        }

        // Bulk reorder for lessons
        if (resource === 'lessons' && body.updates) {
          const updates = body.updates as { id: number; newPosition: number }[];
          await Promise.all(
            updates.map((update) =>
              prisma.lesson.update({
                where: { id: update.id },
                data: { position: update.newPosition }
              })
            )
          );
          return jsonResponse({ success: true });
        }

        // Bulk reorder for sublessons
        if (resource === 'sublessons' && body.updates) {
          const updates = body.updates as { id: number; newPosition: number }[];
          await Promise.all(
            updates.map((update) =>
              prisma.subLesson.update({
                where: { id: update.id },
                data: { orderPosition: update.newPosition }
              })
            )
          );
          return jsonResponse({ success: true });
        }

        if (resource === 't_essay_answer') {
          const updated = await prisma.essayAnswer.update({
            where: { id },
            data: {
              ...(body.answer !== undefined && { answer: body.answer }),
              ...(body.konteks_penjelasan !== undefined && { konteksPenjelasan: body.konteks_penjelasan }),
              ...(body.keruntutan !== undefined && { keruntutan: body.keruntutan }),
              ...(body.kebenaran !== undefined && { kebenaran: body.kebenaran }),
              ...(body.is_approved_by_teacher !== undefined && { isApprovedByTeacher: body.is_approved_by_teacher }),
              ...(body.teacher_notes !== undefined && { teacherNotes: body.teacher_notes }),
            }
          });
          return jsonResponse(updated);
        }
      }
    }
    return jsonResponse({ error: 'Route not found' }, 404);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return jsonResponse({ error: error.message }, 500);
  }
}



export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (path.length === 2) {
    const resource = path[0];
    const id = Number(path[1]);
    if (!isNaN(id)) {
      try {
        if (resource === 'levels') await prisma.level.delete({ where: { id } });
        else if (resource === 'courses') await prisma.course.delete({ where: { id } });
        else if (resource === 'lessons') await prisma.lesson.delete({ where: { id } });
        else if (resource === 'sublessons') await prisma.subLesson.delete({ where: { id } });
        else if (resource === 'materials') await prisma.material.delete({ where: { id } });
        else if (resource === 'code_question') await prisma.codeQuestion.delete({ where: { id } });
        else if (resource === 'essay_question') await prisma.essayQuestion.delete({ where: { id } });
        return jsonResponse({ success: true });
      } catch (error: any) {
        return jsonResponse({ error: error.message }, 500);
      }
    }
  }
  return jsonResponse({ error: 'Route not found' }, 404);
}
