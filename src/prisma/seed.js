const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const dataPath = path.join(__dirname, '../database.json');
  let rawData = fs.readFileSync(dataPath, 'utf8');
  if (rawData.charCodeAt(0) === 0xFEFF) {
    rawData = rawData.slice(1);
  }
  const db = JSON.parse(rawData);

  console.log("Cleaning database tables...");
  await prisma.codeHistoryLog.deleteMany({});
  await prisma.essayAnswer.deleteMany({});
  await prisma.codeAnswer.deleteMany({});
  await prisma.wonderingScore.deleteMany({});
  await prisma.studentProgress.deleteMany({});
  await prisma.studentCourse.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.essayQuestion.deleteMany({});
  await prisma.codeQuestion.deleteMany({});
  await prisma.material.deleteMany({});
  await prisma.subLesson.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.level.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});

  console.log("Seeding roles...");
  const roleIdMap = new Map();
  for (const role of db.roles) {
    const created = await prisma.role.create({
      data: {
        roleName: role.role_name,
        isActive: role.isactive,
      }
    });
    roleIdMap.set(String(role.id), created.id);
  }

  console.log("Seeding permissions...");
  const permIdMap = new Map();
  for (const perm of db.permissions) {
    const roleIds = (perm.role_ids || []).map(id => roleIdMap.get(String(id))).filter(Boolean);
    const created = await prisma.permission.create({
      data: {
        name: perm.name,
        isActive: perm.isactive,
        roles: {
          connect: roleIds.map(id => ({ id }))
        }
      }
    });
    permIdMap.set(String(perm.id), created.id);
  }

  console.log("Seeding classes...");
  const classIdMap = new Map();
  for (const c of db.class) {
    const created = await prisma.class.create({
      data: {
        className: c.class_name,
        schoolName: c.school_name,
        classCode: c.class_code,
        isActive: c.isactive === undefined ? true : c.isactive,
      }
    });
    classIdMap.set(String(c.id), created.id);
  }

  console.log("Seeding users...");
  const userIdMap = new Map();
  for (const u of db.users) {
    const created = await prisma.user.create({
      data: {
        roleId: roleIdMap.get(String(u.role_id)) || Number(u.role_id),
        classId: u.class_id ? classIdMap.get(String(u.class_id)) : null,
        name: u.name,
        email: u.email,
        password: u.password,
        isApprovedByAdmin: u.is_approved_by_admin === undefined ? 1 : Number(u.is_approved_by_admin),
        instansiSekolah: u.instansi_sekolah || "",
        isActive: u.isactive === undefined ? true : u.isactive,
      }
    });
    userIdMap.set(String(u.id), created.id);
  }

  console.log("Updating teacher IDs in classes...");
  for (const c of db.class) {
    if (c.teacher_id) {
      const newTeacherId = userIdMap.get(String(c.teacher_id));
      const newClassId = classIdMap.get(String(c.id));
      if (newTeacherId && newClassId) {
        await prisma.class.update({
          where: { id: newClassId },
          data: { teacherId: newTeacherId }
        });
      }
    }
  }

  console.log("Seeding courses...");
  const courseIdMap = new Map();
  for (const c of db.courses) {
    const created = await prisma.course.create({
      data: {
        courseName: c.course_name,
        description: c.description || "",
        imgThumbnail: c.img_thumbnail || "",
        published: c.published === undefined ? 0 : Number(c.published),
        isActive: c.isactive === undefined ? true : c.isactive,
      }
    });
    courseIdMap.set(String(c.id), created.id);
  }

  console.log("Seeding levels...");
  const levelIdMap = new Map();
  for (const l of db.levels) {
    const created = await prisma.level.create({
      data: {
        levelName: l.level_name,
        description: l.description || "",
        isActive: l.isactive === undefined ? true : l.isactive,
      }
    });
    levelIdMap.set(String(l.id), created.id);
  }

  console.log("Seeding lessons...");
  const lessonIdMap = new Map();
  for (const l of db.lessons) {
    const created = await prisma.lesson.create({
      data: {
        courseId: courseIdMap.get(String(l.course_id)),
        levelId: levelIdMap.get(String(l.level_id)) || Number(l.level_id),
        title: l.title,
        description: l.description || "",
        position: Number(l.position) || 1,
        imgThumbnail: l.img_thumbnail || "",
        published: l.published === undefined ? 0 : Number(l.published),
        isActive: l.isactive === undefined ? true : l.isactive,
      }
    });
    lessonIdMap.set(String(l.id), created.id);
  }

  console.log("Seeding sublessons...");
  const subLessonIdMap = new Map();
  for (const sl of db.sublessons) {
    const created = await prisma.subLesson.create({
      data: {
        lessonId: lessonIdMap.get(String(sl.lesson_id)),
        title: sl.title,
        orderPosition: Number(sl.order_position) || 1,
        isActive: sl.isactive === undefined ? true : sl.isactive,
      }
    });
    subLessonIdMap.set(String(sl.id), created.id);
  }

  console.log("Seeding materials...");
  const materialIdMap = new Map();
  for (const m of db.materials) {
    const created = await prisma.material.create({
      data: {
        subLessonId: subLessonIdMap.get(String(m.sub_lesson_id)),
        title: m.title,
        materials: m.materials || "",
        urlVideo: m.url_video || "",
        contentPosition: Number(m.content_position) || 1,
        promptLim: m.prompt_lim || null,
        published: m.published === undefined ? 1 : Number(m.published),
        isActive: m.isactive === undefined ? true : m.isactive,
      }
    });
    materialIdMap.set(String(m.id), created.id);
  }

  console.log("Seeding code questions...");
  const codeQuestionIdMap = new Map();
  for (const cq of db.code_question) {
    const created = await prisma.codeQuestion.create({
      data: {
        subLessonId: subLessonIdMap.get(String(cq.sub_lesson_id)),
        codeQuestion: cq.code_question || "",
        image: cq.image || null,
        score: Number(cq.score) || 30,
        hint: cq.hint || null,
        isActive: cq.isactive === undefined ? true : cq.isactive,
      }
    });
    codeQuestionIdMap.set(String(cq.id), created.id);
  }

  console.log("Seeding essay questions...");
  const essayQuestionIdMap = new Map();
  for (const eq of db.essay_question) {
    const created = await prisma.essayQuestion.create({
      data: {
        subLessonId: eq.sub_lesson_id ? subLessonIdMap.get(String(eq.sub_lesson_id)) : null,
        codeQuestionId: eq.code_question_id ? codeQuestionIdMap.get(String(eq.code_question_id)) : null,
        essayQuestion: eq.essay_question || "",
        answer: eq.answer || "",
        answer2: eq.answer_2 || eq.answer2 || null,
        answer3: eq.answer_3 || eq.answer3 || null,
        answer4: eq.answer_4 || eq.answer4 || null,
        isActive: eq.isactive === undefined ? true : eq.isactive,
      }
    });
    essayQuestionIdMap.set(String(eq.id), created.id);
  }

  console.log("Seeding badges...");
  const badgeIdMap = new Map();
  for (const b of db.badges) {
    const created = await prisma.badge.create({
      data: {
        name: b.name,
        image: b.image,
        minScore: Number(b.min_score) || 0,
        maxScore: Number(b.max_score) || 100,
        isActive: b.isactive === undefined ? true : b.isactive,
      }
    });
    badgeIdMap.set(String(b.id), created.id);
  }

  console.log("Seeding student courses...");
  for (const sc of db.t_student_course) {
    await prisma.studentCourse.create({
      data: {
        studentId: userIdMap.get(String(sc.student_id)),
        courseId: courseIdMap.get(String(sc.course_id)),
        totalScore: Number(sc.total_score) || 0,
        badgeId: sc.badge_id ? (badgeIdMap.get(String(sc.badge_id)) || Number(sc.badge_id)) : null,
        isActive: sc.isactive === undefined ? true : sc.isactive,
      }
    });
  }

  console.log("Seeding student progresses...");
  for (const sp of db.t_student_progress) {
    await prisma.studentProgress.create({
      data: {
        userId: userIdMap.get(String(sp.user_id)),
        courseId: courseIdMap.get(String(sp.course_id)),
        subLessonId: subLessonIdMap.get(String(sp.sub_lesson_id)),
        status: sp.status || "pending",
        isActive: sp.isactive === undefined ? true : sp.isactive,
      }
    });
  }

  console.log("Seeding wondering scores...");
  if (db.t_wondering_score) {
    for (const ws of db.t_wondering_score) {
      await prisma.wonderingScore.create({
        data: {
          userId: userIdMap.get(String(ws.user_id)),
          subLessonId: subLessonIdMap.get(String(ws.sub_lesson_id)),
          score: Number(ws.score) || 0,
          isActive: ws.isactive === undefined ? true : ws.isactive,
        }
      });
    }
  }

  console.log("Seeding code answers...");
  if (db.t_code_answer) {
    for (const ca of db.t_code_answer) {
      await prisma.codeAnswer.create({
        data: {
          userId: userIdMap.get(String(ca.user_id)),
          codeQuestionId: codeQuestionIdMap.get(String(ca.code_question_id)),
          isCodeRight: ca.is_code_right === undefined ? false : Boolean(ca.is_code_right),
          exploringScore: Number(ca.exploring_score) || 0,
          isActive: ca.isactive === undefined ? true : ca.isactive,
        }
      });
    }
  }

  console.log("Seeding essay answers...");
  if (db.t_essay_answer) {
    for (const ea of db.t_essay_answer) {
      await prisma.essayAnswer.create({
        data: {
          userId: userIdMap.get(String(ea.user_id)),
          essayQuestionId: essayQuestionIdMap.get(String(ea.essay_question_id)),
          answer: ea.answer || "",
          konteksPenjelasan: Number(ea.konteks_penjelasan) || 0,
          keruntutan: Number(ea.keruntutan) || 0,
          kebenaran: Number(ea.kebenaran) || 0,
          teacherNotes: ea.teacher_notes || "",
          isApprovedByTeacher: String(ea.is_approved_by_teacher),
          isActive: ea.isactive === undefined ? true : ea.isactive,
        }
      });
    }
  }

  console.log("Seeding code history logs...");
  if (db.t_code_history_logs) {
    for (const chl of db.t_code_history_logs) {
      await prisma.codeHistoryLog.create({
        data: {
          userId: userIdMap.get(String(chl.user_id)),
          codeQuestionId: codeQuestionIdMap.get(String(chl.code_question_id)),
          timeCount: Number(chl.time_count) || 0,
          message: chl.message || "",
          isError: chl.is_error === undefined ? false : Boolean(chl.is_error),
          isActive: chl.isactive === undefined ? true : chl.isactive,
        }
      });
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
