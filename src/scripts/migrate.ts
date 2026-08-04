import { PrismaClient } from '@prisma/client';
import mysql from 'mysql2/promise';

const prisma = new PrismaClient();

// Konfigurasi koneksi ke database MySQL lama
const mysqlConfig = {
  host: 'localhost', // Sesuaikan dengan host MySQL lama
  user: 'root',      // Sesuaikan username MySQL
  password: '',      // Sesuaikan password MySQL
  database: 'gamification_testing', // Nama database lama sesuai screenshot
};

async function migrateData() {
  console.log('🚀 Memulai proses migrasi data dari MySQL ke Supabase (PostgreSQL)...');
  
  // Buat koneksi ke MySQL
  const connection = await mysql.createConnection(mysqlConfig);

  try {
    // ==========================================
    // 1. MIGRASI ROLES
    // ==========================================
    console.log('⏳ Migrasi data Roles...');
    const [oldRoles]: any = await connection.execute('SELECT * FROM roles');
    
    for (const oldRole of oldRoles) {
      // Kita pakai upsert agar aman jika di-run berulang kali
      await prisma.role.upsert({
        where: { id: oldRole.id },
        update: {}, // Jika sudah ada, lewati
        create: {
          id: oldRole.id,
          roleName: oldRole.role,
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldRoles.length} roles.`);

    // ==========================================
    // 2. MIGRASI COURSES
    // ==========================================
    console.log('⏳ Migrasi data Courses...');
    const [oldCourses]: any = await connection.execute('SELECT * FROM courses');
    
    for (const oldCourse of oldCourses) {
      await prisma.course.upsert({
        where: { id: oldCourse.id },
        update: {},
        create: {
          id: oldCourse.id,
          courseName: oldCourse.course_name,
          description: oldCourse.description || '',
          imgThumbnail: oldCourse.image, // Di MySQL namanya 'image', di Prisma 'imgThumbnail'
          published: oldCourse.published || 0,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldCourses.length} courses.`);

    // ==========================================
    // 3. MIGRASI USERS
    // ==========================================
    console.log('⏳ Migrasi data Users...');
    const [oldUsers]: any = await connection.execute('SELECT * FROM users');
    
    for (const oldUser of oldUsers) {
      // Perhatikan: Karena skema baru ada 'classId' yg wajib/opsional, kita map 'class' (di mysql) ke 'classId' (di prisma).
      // Untuk isApprovedByAdmin & instansiSekolah kita beri nilai default karena di MySQL tidak ada.
      await prisma.user.upsert({
        where: { id: oldUser.id },
        update: {},
        create: {
          id: oldUser.id,
          name: oldUser.name,
          email: oldUser.email,
          password: oldUser.password, // Ingat, password yang dienkripsi bcrypt dari Laravel tetap valid jika backend baru pakai bcrypt juga!
          roleId: oldUser.role_id,
          
          // Field tambahan wajib di skema baru yang tidak ada di lama:
          isApprovedByAdmin: 1, 
          instansiSekolah: "Belum Diisi",
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldUsers.length} users.`);

    // ==========================================
    // 3A. MIGRASI LEVELS
    // ==========================================
    console.log('⏳ Migrasi data Levels...');
    const [oldLevels]: any = await connection.execute('SELECT * FROM levels');
    
    for (const level of oldLevels) {
      await prisma.level.upsert({
        where: { id: level.id },
        update: {},
        create: {
          id: level.id,
          levelName: level.name,
          description: level.description || '',
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldLevels.length} levels.`);

    // ==========================================
    // 3B. MIGRASI LESSONS
    // ==========================================
    console.log('⏳ Migrasi data Lessons...');
    const [oldLessons]: any = await connection.execute('SELECT * FROM lessons');
    
    for (const lesson of oldLessons) {
      await prisma.lesson.upsert({
        where: { id: lesson.id },
        update: {},
        create: {
          id: lesson.id,
          courseId: lesson.course_id,
          levelId: lesson.level_id || 1, // default jika null
          title: lesson.title,
          description: lesson.description || '',
          position: lesson.posisition || 1, // Typo di db lama 'posisition'
          published: lesson.published || 0,
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldLessons.length} lessons.`);

    // ==========================================
    // 4. MIGRASI CONTENTS (SubLesson & Materials)
    // ==========================================
    console.log('⏳ Migrasi data Contents (SubLesson & Materials)...');
    const [oldContents]: any = await connection.execute('SELECT * FROM contents');
    
    // Counter ID agar tidak bentrok jika 1 content dipecah
    let materialIdCounter = await prisma.material.count() + 1000; 

    for (const content of oldContents) {
      // Buat SubLesson
      await prisma.subLesson.upsert({
        where: { id: content.id },
        update: {},
        create: {
          id: content.id,
          lessonId: content.lesson_id,
          title: content.title,
          orderPosition: 1, 
          isActive: true,
        },
      });

      let currentPos = 1; // Mengatur urutan material di dalam sublesson

      // Material 1: JIKA ADA VIDEO, pasti ditaruh di contentPosition 1
      if (content.url_video && content.url_video.trim() !== '') {
        await prisma.material.create({
          data: {
            id: materialIdCounter++,
            subLessonId: content.id,
            title: "Video Pembelajaran: " + content.title,
            materials: "", // Teks kosong karena ini video
            urlVideo: content.url_video,
            contentPosition: currentPos, // Pasti posisi 1
            published: content.published || 1,
            isActive: true,
          },
        });
        currentPos++; // Naikkan posisi untuk materi berikutnya
      }

      // Material Berikutnya: TEKS/DESKRIPSI utuh (Tanpa dipecah-pecah lagi biar aman)
      if (content.description && content.description.trim() !== '') {
        await prisma.material.create({
          data: {
            id: materialIdCounter++,
            subLessonId: content.id,
            title: "Materi Pembelajaran",
            materials: content.description,
            urlVideo: null,
            contentPosition: currentPos, // Posisi 2 (jika ada video), atau Posisi 1 (jika tidak ada video)
            published: content.published || 1,
            isActive: true,
          },
        });
      }
    }
    console.log(`✅ Berhasil migrasi contents menjadi SubLesson dan Materials.`);

    // ==========================================
    // 5. MIGRASI BADGE SETTINGS
    // ==========================================
    console.log('⏳ Migrasi data Badge Settings...');
    const [oldBadges]: any = await connection.execute('SELECT * FROM badge_settings');
    for (const badge of oldBadges) {
      await prisma.badge.upsert({
        where: { id: badge.id },
        update: {},
        create: {
          id: badge.id,
          name: badge.name,
          image: badge.file || '', 
          minScore: badge.min || 0,
          maxScore: badge.max || 0,
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${oldBadges.length} badge settings.`);

    // ==========================================
    // 6. MIGRASI QUESTIONS (CODE & ESSAY)
    // ==========================================
    console.log('⏳ Migrasi data Code Questions & Essay Questions...');
    const [allOldQuestions]: any = await connection.execute('SELECT * FROM questions');
    const [allOldEssayQuestions]: any = await connection.execute('SELECT * FROM essay_question');
    
    // A. CODE QUESTIONS (Ambil SEMUA dari tabel questions sesuai instruksimu)
    for (const q of allOldQuestions) {
      await prisma.codeQuestion.upsert({
        where: { id: q.id },
        update: {},
        create: {
          id: q.id,
          subLessonId: q.content_id, // Terhubung langsung dengan SubLesson!
          codeQuestion: q.question,
          image: q.image || null,
          score: q.score || 30,
          hint: q.hint || null,
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${allOldQuestions.length} Code Questions dari tabel questions.`);

    // B. ESSAY QUESTIONS
    for (const eq of allOldEssayQuestions) {
      // Cari pertanyaan induknya di db lama
      const parentQ = allOldQuestions.find((q: any) => q.id === eq.question_id);
      
      let finalSubLessonId = null;
      let finalCodeQuestionId = null;

      if (parentQ) {
        // Karena sekarang SEMUA pertanyaan dari tabel 'questions' masuk ke CodeQuestion,
        // maka induk dari essay ini otomatis adalah CodeQuestion!
        finalCodeQuestionId = parentQ.id;
        finalSubLessonId = parentQ.content_id;
      }
      
      await prisma.essayQuestion.upsert({
        where: { id: eq.id },
        update: {},
        create: {
          id: eq.id,
          subLessonId: finalSubLessonId, // Akan terhubung dengan SubLesson!
          codeQuestionId: finalCodeQuestionId,
          essayQuestion: eq.question || 'Pertanyaan Essay',
          answer: eq.answer || '',
          answer2: eq.answer2 || null,
          answer3: eq.answer3 || null,
          answer4: eq.answer4 || null,
          isActive: true,
        },
      });
    }
    console.log(`✅ Berhasil migrasi ${allOldEssayQuestions.length} Essay Questions.`);

    // ==========================================
    // (Tambahkan migrasi tabel lainnya di sini)
    // ==========================================

    console.log('🎉 MIGRASI SELESAI!');

  } catch (error) {
    console.error('❌ Terjadi kesalahan saat migrasi:', error);
  } finally {
    // Selalu tutup koneksi setelah selesai
    await connection.end();
    await prisma.$disconnect();
  }
}

migrateData();
