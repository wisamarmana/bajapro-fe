"use client";
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  Button,
  Spin,
  Input,
  Modal,
  message,
  Collapse,
  Tour,
  TourProps
} from "antd";
import {
  BookOutlined,
  PlayCircleOutlined,
  CheckCircleFilled,
  LockOutlined,
  TrophyOutlined,
  PlayCircleFilled,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  LeftOutlined,
  RightOutlined,
  CheckCircleOutlined,
  SendOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/hooks/useAuth";
import {
  getCourseMaterialTreeApi,
  getStudentProgressApi,
  getStudentCourseProgressApi,
  submitPracticeAnswersApi
} from "@/src/actions/student/studentApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

function getYouTubeEmbedUrl(url: string) {
  if (!url) return null;
  try {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?#]/)[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (e) {
    // Ignore URL parsing errors
  }

  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function MaterialCourseidLevelidManager() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const courseId = Number(params?.courseId);
  const levelId = Number(params?.levelId);
  const urlSubLessonId = searchParams?.get("subLessonId");
  const fromLevel = searchParams?.get("fromLevel") === "true";

  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState<number>(5);

  // Data States
  const [courseTree, setCourseTree] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any>(null);

  // Active / Navigation States
  const [activeSubLessonId, setActiveSubLessonId] = useState<number | null>(null);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState<number>(0);
  const [activeView, setActiveView] = useState<"material" | "practice">("material");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // Code Editor states
  const [codeContent, setCodeContent] = useState<string>("");
  const [essayAnswers, setEssayAnswers] = useState<Record<number, string>>({});
  const [runOutput, setRunOutput] = useState<string>("Run compiler is ready. Click 'Run' to compile and validate tests.");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [scoreGained, setScoreGained] = useState<number>(0);
  const [isCodeCorrect, setIsCodeCorrect] = useState<boolean>(false);
  const [codeScore, setCodeScore] = useState<number>(0);

  const [messageApi, contextHolder] = message.useMessage();

  const { user } = useAuth();

  // Tour States
  const [tourOpen, setTourOpen] = useState(false);
  const refProgress = React.useRef(null);
  const refList = React.useRef(null);
  const refContent = React.useRef(null);
  const refNext = React.useRef(null);

  const tourSteps: TourProps['steps'] = [
    {
      title: 'Progress Belajar',
      description: 'Ini adalah progress belajarmu di course ini. Kumpulkan skor dan dapatkan badge!',
      target: () => refProgress.current,
    },
    {
      title: 'Daftar Materi',
      description: 'Di sini kamu bisa melihat materi apa saja yang akan dipelajari.',
      target: () => refList.current,
    },
    {
      title: 'Konten Pembelajaran',
      description: 'Ini adalah konten yang perlu kamu baca atau tonton.',
      target: () => refContent.current,
    },
    {
      title: 'Lanjut ke Materi Berikutnya',
      description: 'Klik tombol ini jika kamu sudah selesai dan ingin lanjut.',
      target: () => refNext.current,
    },
  ];

  const [tourOpenPractice, setTourOpenPractice] = useState(false);
  const refStudiKasus = React.useRef(null);
  const refEssay = React.useRef(null);
  const refEditor = React.useRef(null);
  const refRun = React.useRef(null);
  const refSubmit = React.useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const tourStepsPractice: TourProps['steps'] = [
    {
      title: 'Studi Kasus',
      description: 'Baca dan pahami studi kasus ini sebelum menulis kode.',
      target: () => refStudiKasus.current,
    },
    {
      title: 'Pertanyaan Esai',
      description: 'Jawab pertanyaan esai ini berdasarkan pemahamanmu tentang materi dan kasus.',
      target: () => refEssay.current,
    },
    {
      title: 'Code Editor',
      description: 'Tulis kodemu di sini untuk menyelesaikan studi kasus.',
      target: () => refEditor.current,
    },
    {
      title: 'Jalankan Kode',
      description: 'Klik tombol Run untuk melihat hasil eksekusi kodemu.',
      target: () => refRun.current,
    },
    {
      title: 'Submit Test',
      description: 'Jika semuanya sudah selesai dan benar, klik tombol ini untuk mengirim jawaban.',
      target: () => refSubmit.current,
    },
  ];

  // Load User Info
  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);
    }
  }, [user?.id]);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        treeResponse,
        progressResponse,
        courseProgressResponse
      ] = await Promise.all([
        getCourseMaterialTreeApi(courseId, levelId),
        getStudentProgressApi(courseId),
        getStudentCourseProgressApi(courseId)
      ]);

      // Response backend:
      // { success: true, data: [...] }
      const rawTree = Array.isArray(treeResponse)
        ? treeResponse
        : Array.isArray(treeResponse?.data)
          ? treeResponse.data
          : Array.isArray(treeResponse?.data?.data)
            ? treeResponse.data.data
            : [];

      const tree = rawTree.map((lesson: any) => ({
        ...lesson,
        sublessons: Array.isArray(lesson?.sublessons)
          ? lesson.sublessons
          : Array.isArray(lesson?.subLessons)
            ? lesson.subLessons
            : Array.isArray(lesson?.sub_lessons)
              ? lesson.sub_lessons
              : []
      }));

      const progress = Array.isArray(progressResponse)
        ? progressResponse
        : Array.isArray(progressResponse?.data)
          ? progressResponse.data
          : [];

      const courseProg =
        courseProgressResponse?.data ??
        courseProgressResponse ??
        null;

      setCourseTree(tree);
      setStudentProgress(progress);
      setCourseProgress(courseProg);

      // Buka lesson yang masih memiliki sublesson belum selesai
      const initialExpandedKeys = tree
        .filter((lesson: any) => {
          const sublessons = Array.isArray(lesson?.sublessons)
            ? lesson.sublessons
            : [];

          if (sublessons.length === 0) {
            return false;
          }

          const allCompleted = sublessons.every((sl: any) =>
            progress.some(
              (p: any) =>
                Number(p.sub_lesson_id) === Number(sl.id) &&
                p.status === "completed"
            )
          );

          return !allCompleted;
        })
        .map((lesson: any) => String(lesson.id));

      setExpandedKeys(initialExpandedKeys);

      const savedState = localStorage.getItem(
        `materialState_${courseId}_${levelId}`
      );

      let parsedState: any = {};

      if (savedState && !fromLevel) {
        try {
          parsedState = JSON.parse(savedState);
        } catch {
          parsedState = {};
        }
      }

      let defaultSubL: any = null;

      // 1. Ambil sublesson dari query URL
      if (urlSubLessonId) {
        for (const lesson of tree) {
          const sublessons = Array.isArray(lesson?.sublessons)
            ? lesson.sublessons
            : [];

          const found = sublessons.find(
            (sl: any) =>
              String(sl.id) === String(urlSubLessonId)
          );

          if (found) {
            defaultSubL = found;
            break;
          }
        }
      }

      // 2. Ambil sublesson dari localStorage
      if (!defaultSubL && parsedState.subLessonId) {
        for (const lesson of tree) {
          const sublessons = Array.isArray(lesson?.sublessons)
            ? lesson.sublessons
            : [];

          const found = sublessons.find(
            (sl: any) =>
              Number(sl.id) === Number(parsedState.subLessonId)
          );

          if (found) {
            defaultSubL = found;
            break;
          }
        }
      }

      // 3. Cari sublesson pertama yang belum selesai
      if (!defaultSubL) {
        for (const lesson of tree) {
          const sublessons = Array.isArray(lesson?.sublessons)
            ? lesson.sublessons
            : [];

          const incomplete = sublessons.find((sl: any) => {
            const itemProgress = progress.find(
              (p: any) =>
                Number(p.sub_lesson_id) === Number(sl.id)
            );

            return (
              !itemProgress ||
              itemProgress.status !== "completed"
            );
          });

          if (incomplete) {
            defaultSubL = incomplete;
            break;
          }
        }
      }

      // 4. Jika semuanya sudah selesai, pilih sublesson pertama
      if (!defaultSubL) {
        for (const lesson of tree) {
          const sublessons = Array.isArray(lesson?.sublessons)
            ? lesson.sublessons
            : [];

          if (sublessons.length > 0) {
            defaultSubL = sublessons[0];
            break;
          }
        }
      }

      console.log({
        urlSubLessonId,
        parsedState,
        defaultSubL,
        progress,
      });

      if (!defaultSubL) {
        setActiveSubLessonId(null);
        setActiveMaterialIndex(0);
        setActiveView("material");

        console.error("Sublesson tidak ditemukan:", tree);
        return;
      }

      setActiveSubLessonId(Number(defaultSubL.id));

      const materials = Array.isArray(defaultSubL.materials)
        ? defaultSubL.materials
        : [];

      const savedMaterialIndex = Number(parsedState.section);

      if (
        Number.isInteger(savedMaterialIndex) &&
        savedMaterialIndex >= 0 &&
        savedMaterialIndex < materials.length
      ) {
        setActiveMaterialIndex(savedMaterialIndex);
      } else {
        setActiveMaterialIndex(0);
      }

      if (
        parsedState.view === "practice" &&
        (
          defaultSubL.codeQuestion ||
          (
            Array.isArray(defaultSubL.essayQuestions) &&
            defaultSubL.essayQuestions.length > 0
          )
        )
      ) {
        setActiveView("practice");
      } else {
        setActiveView("material");
      }

      if (defaultSubL.codeQuestion) {
        setCodeContent(
          defaultSubL.codeQuestion.hint ||
          "// Tulis kodemu di sini..."
        );
      } else {
        setCodeContent("");
      }
    } catch (error) {
      console.error("Gagal mengambil data materi:", error);

      setCourseTree([]);
      setStudentProgress([]);
      setCourseProgress(null);
      setActiveSubLessonId(null);
      setActiveMaterialIndex(0);

      messageApi.error("Gagal memuat materi pembelajaran.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId && courseId && levelId) {
      fetchData();
    }
  }, [studentId, courseId, levelId]);

  useEffect(() => {
    if (fromLevel && courseId && levelId) {
      router.replace(`/student/material/${courseId}/${levelId}`);
    }
  }, [fromLevel, courseId, levelId, router]);


  useEffect(() => {
    if (activeSubLessonId) {
      localStorage.setItem(`materialState_${courseId}_${levelId}`, JSON.stringify({
        subLessonId: activeSubLessonId,
        view: activeView,
        section: activeMaterialIndex
      }));
    }
  }, [activeSubLessonId, activeView, activeMaterialIndex, courseId, levelId]);

  // Find active sublesson object
  const getActiveSubLesson = () => {
    for (const lesson of courseTree) {
      const sublessons = Array.isArray(lesson?.sublessons)
        ? lesson.sublessons
        : [];

      const found = sublessons.find(
        (sl: any) =>
          Number(sl.id) === Number(activeSubLessonId)
      );

      if (found) {
        return found;
      }
    }

    return null;
  };
  const activeSubLesson = getActiveSubLesson();

  // Get parent lesson for active sublesson
  const getActiveLesson = () => {
    for (const lesson of courseTree) {
      const sublessons = Array.isArray(lesson?.sublessons)
        ? lesson.sublessons
        : [];

      const found = sublessons.some(
        (sl: any) =>
          Number(sl.id) === Number(activeSubLessonId)
      );

      if (found) {
        return lesson;
      }
    }

    return null;
  };
  const activeLesson = getActiveLesson();

  // Get sorted materials for current sublesson
  const currentMaterials = Array.isArray(activeSubLesson?.materials)
    ? [...activeSubLesson.materials].sort(
      (a: any, b: any) =>
        Number(a.content_position || 0) -
        Number(b.content_position || 0)
    )
    : [];

  console.log(currentMaterials);
  const hasTest = activeSubLesson?.codeQuestion || (activeSubLesson?.essayQuestions && activeSubLesson.essayQuestions.length > 0);
  const totalSections = currentMaterials.length + (hasTest ? 1 : 0);
  const isOnTestSection = activeView === "practice";
  const currentMaterial =
    currentMaterials[activeMaterialIndex] ?? null;

  // Find all sublessons in linear sequence for navigation
  const getSubLessonsSequence = () => {
    const seq: any[] = [];

    courseTree.forEach((lesson: any) => {
      const sublessons = Array.isArray(lesson?.sublessons)
        ? lesson.sublessons
        : [];

      sublessons.forEach((sl: any) => {
        seq.push(sl);
      });
    });

    return seq;
  };

  const subLessonsSequence = getSubLessonsSequence();
  const currentIndex = subLessonsSequence.findIndex(sl => Number(sl.id) === Number(activeSubLessonId));

  // Determine if a sublesson is locked
  const isSubLessonLocked = (subLId: number) => {
    const seq = getSubLessonsSequence();
    const idx = seq.findIndex(sl => Number(sl.id) === Number(subLId));
    if (idx <= 0) return false; // First sublesson is always unlocked

    // Check if the previous one in the sequence is completed
    const prevSubL = seq[idx - 1];
    const prevProg = studentProgress.find(p => Number(p.sub_lesson_id) === Number(prevSubL.id));
    return !prevProg || prevProg.status !== "completed";
  };

  // Change Sub Lesson
  const handleSelectSubLesson = (subL: any) => {
    if (isSubLessonLocked(subL.id)) {
      messageApi.warning("Materi ini masih terkunci! Selesaikan materi sebelumnya terlebih dahulu.");
      return;
    }
    setActiveSubLessonId(subL.id);
    setActiveMaterialIndex(0);
    setActiveView("material");
    setRunOutput("Run compiler is ready. Click 'Run' to compile and validate tests.");
    if (subL.codeQuestion) {
      setCodeContent(subL.codeQuestion.hint || "// Tulis kodemu di sini...");
    } else {
      setCodeContent("");
    }
    setEssayAnswers({});
    setIsCodeCorrect(false);
    setCodeScore(0);
  };

  // Handle run code
  const handleRunCode = async () => {
    if (!codeContent.trim()) {
      messageApi.warning("Silakan tulis kode sebelum melakukan Run!");
      return;
    }

    setIsRunning(true);
    setRunOutput("Compiling files...\nLinking libraries...\nExecuting tests...\n\n");

    try {
      // NOTE: User parameter can be the student name or ID. Test cases should exist on the Django server.
      const questionId = activeSubLesson?.codeQuestion?.id;

      if (!questionId) {
        messageApi.error("Code question tidak ditemukan.");
        return;
      }

      const token = localStorage.getItem("access_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/code_questions/${questionId}/run`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: user?.email,
            code: codeContent,
            codeQuestionID: questionId,
          }),
        }
      );

      const data = await res.json();

      // Response dari presenters.SuccessResponse()
      const payload = data?.data ?? {};
      const output = payload?.output ?? {};
      const result = payload?.result ?? {};

      if (!res.ok || data?.error) {
        const errorMessage =
          data?.message ||
          data?.error ||
          payload?.error ||
          "Terjadi kesalahan pada compiler.";

        let logs = `Server Error: ${errorMessage}\n\n`;

        if (data?.raw) {
          logs += String(data.raw).substring(0, 500);
        }

        setRunOutput(logs);
        setIsCodeCorrect(false);
        setCodeScore(0);

        messageApi.error("Gagal menjalankan kode.");
        return;
      }

      const javaOutput = output?.java ?? "";
      const testOutput = output?.test_output ?? "";

      const point = Number(
        result?.point ??
        output?.point ??
        0
      );

      const passed =
        typeof result?.passed === "boolean"
          ? result.passed
          : !javaOutput.toLowerCase().includes("failed") &&
          !testOutput.toUpperCase().includes("FAILED");

      const logs = [
        `[Java Compiler]`,
        javaOutput,
        ``,
        `[Test Output]`,
        testOutput,
        ``,
        `[Points]`,
        `Score: ${point}`,
      ].join("\n");

      setRunOutput(logs);
      setIsCodeCorrect(passed);
      setCodeScore(point);

      if (passed) {
        messageApi.success("Kode berhasil dan semua pengujian lulus!");
      } else {
        messageApi.error(
          "Kode belum lulus pengujian. Silakan periksa output."
        );
      }
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "Unknown error";

      setRunOutput(
        `Failed to reach compiler server: ${errorMessage}`
      );

      setIsCodeCorrect(false);
      setCodeScore(0);

      messageApi.error("Gagal menghubungi server compiler.");
    } finally {
      setIsRunning(false);
    }
  };

  // Submit test
  const handleSubmitTest = async () => {
    if (!activeSubLesson) return;

    // Check code question
    if (activeSubLesson.codeQuestion) {
      if (!codeContent.trim()) {
        messageApi.warning("Silakan isi Code Editor terlebih dahulu!");
        return;
      }
      if (!isCodeCorrect) {
        messageApi.warning("Kode kamu masih ada yang salah atau belum dijalankan (Run). Pastikan kode benar sebelum submit!");
        return;
      }
    }

    // Check essay answers
    const missingEssay = activeSubLesson.essayQuestions.some((eq: any) => !essayAnswers[eq.id]?.trim());
    if (missingEssay) {
      messageApi.warning("Harap jawab semua pertanyaan essay yang tersedia!");
      return;
    }

    try {
      setIsSubmitting(true);

      const payloadEssay = activeSubLesson.essayQuestions.map((eq: any) => ({
        essayQuestionId: Number(eq.id),
        answer: essayAnswers[eq.id] || ""
      }));

      const codePts = activeSubLesson.codeQuestion ? codeScore : 0;
      const essayPts = payloadEssay.length * 20;
      const totalPoints = 10 + codePts + essayPts; // 10 pts for wondering score

      await submitPracticeAnswersApi({
        courseId,
        subLessonId: activeSubLesson.id,
        codeQuestionId: activeSubLesson.codeQuestion ? Number(activeSubLesson.codeQuestion.id) : null,
        codeAnswer: codeContent,
        essayAnswers: payloadEssay,
        scoreToAdd: codePts
      });

      // Show popup
      setScoreGained(totalPoints);
      setShowSuccessModal(true);
      // Reload states locally to update progress sidebar in background
      Promise.all([
        getStudentProgressApi(courseId),
        getStudentCourseProgressApi(courseId)
      ]).then(([newProgress, newCourseProg]) => {
        setStudentProgress(newProgress);
        setCourseProgress(newCourseProg);
      }).catch(console.error);

    } catch (e) {
      console.error(e);
      messageApi.error("Gagal melakukan submit materi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Next / Previous navigation buttons - section-based
  const handleNextSection = () => {
    if (activeView === "material") {
      // If more materials to show, go to next material
      if (activeMaterialIndex < currentMaterials.length - 1) {
        setActiveMaterialIndex(activeMaterialIndex + 1);
        window.scrollTo(0, 0);
      } else if (hasTest) {
        // All materials done, go to test section
        setActiveView("practice");
        window.scrollTo(0, 0);
      } else {
        // No test, go to next sublesson
        if (currentIndex < subLessonsSequence.length - 1) {
          handleSelectSubLesson(subLessonsSequence[currentIndex + 1]);
        } else {
          messageApi.success("Selamat! Kamu telah menyelesaikan seluruh materi di level ini.");
        }
      }
    } else {
      messageApi.info("Silakan klik 'Submit Test' untuk menyelesaikan bab ini!");
    }
  };

  const handlePrevSection = () => {
    if (activeView === "practice") {
      setActiveView("material");
      setActiveMaterialIndex(currentMaterials.length - 1);
      window.scrollTo(0, 0);
    } else {
      if (activeMaterialIndex > 0) {
        setActiveMaterialIndex(activeMaterialIndex - 1);
        window.scrollTo(0, 0);
      } else if (currentIndex > 0) {
        const prevSub = subLessonsSequence[currentIndex - 1];
        handleSelectSubLesson(prevSub);
      }
    }
  };

  // Get current section label for footer
  const getSectionLabel = () => {
    if (activeView === "practice") return "Latihan & Soal";
    if (currentMaterial) return currentMaterial.title || `Materi ${activeMaterialIndex + 1}`;
    return "Materi Pembelajaran";
  };

  const getSectionProgress = () => {
    if (activeView === "practice") return `${totalSections} / ${totalSections}`;
    return `${activeMaterialIndex + 1} / ${totalSections}`;
  };

  const handleNextFromModal = () => {
    setShowSuccessModal(false);
    const seq = getSubLessonsSequence();
    const nextIdx = seq.findIndex(sl => Number(sl.id) === Number(activeSubLessonId)) + 1;
    if (nextIdx < seq.length) {
      const nextSub = seq[nextIdx];
      setActiveSubLessonId(nextSub.id);
      setActiveView("material");
      setRunOutput("Run compiler is ready. Click 'Run' to compile and validate tests.");
      if (nextSub.codeQuestion) {
        setCodeContent(nextSub.codeQuestion.hint || "// Tulis kodemu di sini...");
      } else {
        setCodeContent("");
      }
      setEssayAnswers({});
      setIsCodeCorrect(false);
      setCodeScore(0);
    } else {
      messageApi.success("Luar biasa! Kamu telah melahap habis semua materi level ini. Kembali ke peta petualangan!");
      router.push(`/student/level/${courseId}`);
    }
  };

  // Calculate Progress Percent
  const getProgressPercent = () => {
    if (subLessonsSequence.length === 0) return 0;
    const completedCount = subLessonsSequence.filter(sl => {
      const prog = studentProgress.find(p => Number(p.sub_lesson_id) === Number(sl.id));
      return prog && prog.status === "completed";
    }).length;

    return Math.round((completedCount / subLessonsSequence.length) * 100);
  };

  const progressPercent = getProgressPercent();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>;
  }

  const renderStepIndicator = () => {
    let currentStep = 0;
    if (activeView === "practice") {
      currentStep = 2;
    } else if (currentMaterial) {
      if (currentMaterial.url_video) {
        currentStep = 0;
      } else {
        currentStep = 1;
      }
    }

    const steps = [
      { label: "Video Tutorial", type: "video" },
      { label: "Reading Material", type: "reading" },
      { label: "Practice Quiz", type: "practice" }
    ];

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "32px", width: "100%" }}>
        {steps.map((step, idx) => {
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;

          return (
            <React.Fragment key={idx}>
              {/* Step node */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isCompleted ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#10b981", color: "#fff", fontSize: "14px" }}>
                    <CheckCircleFilled style={{ color: "#fff", fontSize: "14px" }} />
                  </div>
                ) : isActive ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #7c3aed", color: "#7c3aed", fontWeight: "bold", fontSize: "12px" }}>
                    {idx + 1}
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px", borderRadius: "50%", border: "2px solid #cbd5e1", color: "#94a3b8", fontWeight: "bold", fontSize: "12px" }}>
                    {idx + 1}
                  </div>
                )}
                <Text style={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#7c3aed" : isCompleted ? "#10b981" : "#94a3b8",
                  fontSize: "13px"
                }}>
                  {step.label}
                </Text>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div style={{ flex: "0 1 80px", height: "2px", backgroundColor: idx < currentStep ? "#10b981" : "#e2e8f0" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "calc(100vh - 72px)", position: "relative", backgroundColor: "#f8fafc" }}>
      {contextHolder}

      {/* SUCCESS MODAL POPUP */}
      <AnimatePresence>
        {showSuccessModal && (
          <Modal
            open={showSuccessModal}
            footer={null}
            closable={false}
            centered
            width={480}
            styles={{ body: { padding: "40px 32px", textAlign: "center", borderRadius: "24px" } }}
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                <div style={{ position: "relative" }}>
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}>
                    <img
                      src="/assets/gamification/lv 3.png"
                      alt="Trophy"
                      style={{ width: "120px", height: "120px" }}
                      onError={(e: any) => { e.target.src = "https://api.dicebear.com/7.x/shapes/svg?seed=trophy"; }}
                    />
                  </motion.div>
                  <div style={{ position: "absolute", top: -10, right: -10, background: "#52c41a", color: "#fff", borderRadius: "50%", padding: "4px 8px", fontSize: "12px", fontWeight: "bold" }}>
                    PASSED!
                  </div>
                </div>
              </div>

              <Title level={2} style={{ fontWeight: 800, color: "#1e293b", margin: "0 0 8px 0" }}>Luar Biasa!</Title>
              <Paragraph style={{ color: "#64748b", fontSize: "15px", marginBottom: "20px", lineHeight: 1.6 }}>
                Kamu telah berhasil menyelesaikan dan mengirimkan materi <span style={{ fontWeight: 700, color: "#531DAB" }}>{activeSubLesson?.title}</span>!
              </Paragraph>

              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "32px", border: "1px dashed #cbd5e1" }}>
                <Text style={{ fontSize: "14px", color: "#64748b", display: "block", marginBottom: "4px" }}>Total Poin Diperoleh</Text>
                <Text style={{ fontSize: "28px", fontWeight: 800, color: "#f59e0b" }}>+{scoreGained} PTS</Text>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleNextFromModal}
                  style={{
                    background: "linear-gradient(135deg, #FF9900 0%, #FF5E00 100%)",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    height: "48px",
                    boxShadow: "0 4px 12px rgba(255, 94, 0, 0.2)"
                  }}
                >
                  Materi Selanjutnya <RightOutlined />
                </Button>
                <Button
                  type="text"
                  size="large"
                  block
                  onClick={() => router.push(`/student/report/${courseId}`)}
                  style={{ color: "#64748b", fontWeight: 600 }}
                >
                  Lihat Report
                </Button>
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      {/* FLOATING SIDEBAR TOGGLE BUTTON (WHEN COLLAPSED) */}
      {!sidebarOpen && (
        <div style={{ position: "fixed", left: "16px", top: "92px", zIndex: 1000 }}>
          <Button
            type="primary"
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => setSidebarOpen(true)}
            style={{
              backgroundColor: "#F59E0B",
              borderColor: "#F59E0B",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.4)",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          />
        </div>
      )}

      {/* LEFT COLLAPSIBLE SIDEBAR */}
      {activeView !== "practice" && (
        <div className="material-sidebar" style={{
          width: sidebarOpen ? "320px" : "0px",
          minWidth: sidebarOpen ? "320px" : "0px",
          transition: "all 0.3s ease",
          overflow: "hidden",
          borderRight: sidebarOpen ? "1px solid #e2e8f0" : "none",
          backgroundColor: "#ffffff",
          position: "sticky",
          top: "72px",
          height: "calc(100vh - 72px)",
          display: "flex",
          flexDirection: "column",
          zIndex: 900
        }}>
          {/* Sidebar Header */}
          <div style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9" }}>
            <div>
              <Text style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600, display: "block" }}>Course</Text>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>{activeLesson?.title || "Java"}</Title>
            </div>
            <Button
              type="primary"
              shape="circle"
              icon={<LeftOutlined />}
              onClick={() => setSidebarOpen(false)}
              style={{
                backgroundColor: "#F59E0B",
                borderColor: "#F59E0B",
                color: "#ffffff",
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px"
              }}
            />
          </div>

          {/* Sidebar Scrollable Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px", scrollbarWidth: "none", minHeight: 0 }}>

            {/* PROGRESS CARD */}
            <motion.div ref={refProgress} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #FA8B7C 0%, #FF6B8B 100%)",
                  color: "#ffffff",
                  boxShadow: "0 10px 25px rgba(255, 107, 139, 0.2)"
                }}
                styles={{ body: { padding: "20px" } }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <ThunderboltOutlined style={{ fontSize: "16px", color: "#fff" }} />
                  <Text style={{ fontWeight: 800, color: "#ffffff", fontSize: "14px" }}>Your Progress</Text>
                </div>

                <Progress
                  percent={progressPercent}
                  strokeColor="#ffffff"
                  railColor="rgba(255,255,255,0.3)"
                  status="active"
                  style={{ marginBottom: "16px" }}
                  format={(p) => <span style={{ color: "#fff", fontWeight: 800 }}>{p}%</span>}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <Text style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Current Badge</Text>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <TrophyOutlined style={{ color: "#FFE58F", fontSize: "12px" }} />
                      <Text style={{ fontWeight: 800, color: "#fff", fontSize: "12px" }}>{courseProgress?.badge?.name || "Warrior"}</Text>
                    </div>
                  </div>
                  <div style={{ flex: 1, background: "rgba(255,255,255,0.2)", borderRadius: "12px", padding: "8px", textAlign: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
                    <Text style={{ fontSize: "9px", color: "rgba(255,255,255,0.9)", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Total Score</Text>
                    <Text style={{ fontWeight: 800, color: "#fff", fontSize: "12px" }}>{courseProgress?.total_score || "0"}</Text>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* LIST MATERIAL Section */}
            <motion.div ref={refList} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                <BookOutlined style={{ color: "#7c3aed", fontSize: "16px" }} />
                <Title level={5} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>List Material</Title>
              </div>

              <Collapse
                ghost
                activeKey={expandedKeys}
                onChange={(keys) => setExpandedKeys(keys as string[])}
                expandIconPlacement="end"
                style={{ padding: 0 }}
                items={courseTree.map((lesson) => {
                  const allCompleted = lesson.sublessons.every((sl: any) =>
                    studentProgress.some((p: any) => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed")
                  );
                  const completedCount = lesson.sublessons.filter((sl: any) =>
                    studentProgress.some((p: any) => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed")
                  ).length;

                  return {
                    key: String(lesson.id),
                    label: (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                        <Text style={{ fontWeight: 700, color: "#334155", fontSize: "13px" }}>
                          {lesson.title}
                        </Text>
                        {allCompleted ? (
                          <CheckCircleFilled style={{ color: "#52c41a", fontSize: "14px" }} />
                        ) : (
                          <Text style={{ color: "#94a3b8", fontSize: "10px", fontWeight: 600 }}>
                            {completedCount}/{lesson.sublessons.length}
                          </Text>
                        )}
                      </div>
                    ),
                    children: (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", paddingLeft: "4px" }}>
                        {lesson.sublessons.map((sl: any) => {
                          const isCompleted = studentProgress.some(p => Number(p.sub_lesson_id) === Number(sl.id) && p.status === "completed");
                          const isActive = Number(sl.id) === Number(activeSubLessonId);
                          const isLocked = isSubLessonLocked(sl.id);

                          return (
                            <div
                              key={sl.id}
                              onClick={() => !isLocked && handleSelectSubLesson(sl)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                cursor: isLocked ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                background: isActive ? "#f5f3ff" : "#ffffff",
                                border: isActive ? "1px solid #c084fc" : "1px solid transparent",
                                opacity: isLocked ? 0.6 : 1
                              }}
                              className="sublesson-item-hover"
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                                {isCompleted ? (
                                  <CheckCircleFilled style={{ color: "#52c41a", fontSize: "14px" }} />
                                ) : isActive ? (
                                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #7c3aed" }} />
                                ) : isLocked ? (
                                  <LockOutlined style={{ color: "#94a3b8", fontSize: "14px" }} />
                                ) : (
                                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #cbd5e1" }} />
                                )}
                                <Text style={{
                                  fontSize: "12px",
                                  fontWeight: isActive ? 700 : 500,
                                  color: isActive ? "#5b21b6" : isLocked ? "#94a3b8" : "#475569"
                                }}>
                                  {sl.title}
                                </Text>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  };
                })}
              />
            </motion.div>
          </div>

          {/* Sidebar Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #f1f5f9", backgroundColor: "#ffffff" }}>
            <Button
              type="default"
              icon={<ArrowLeftOutlined style={{ color: "#7c3aed" }} />}
              onClick={() => router.push(`/student/level/${courseId}`)}
              style={{ fontWeight: 700, color: "#4b5563", width: "100%", height: "42px", borderRadius: "10px", borderColor: "#cbd5e1" }}
            >
              Kembali ke Level
            </Button>
          </div>
        </div>
      )}

      {/* RIGHT MAIN CONTENT AREA */}
      <div style={{ flex: 1, minWidth: 0, padding: "32px 40px", display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "140px" }}>

        {/* STEP PROGRESS INDICATOR HEADER */}
        {activeSubLesson && renderStepIndicator()}

        {/* MATERIAL VIEW */}
        {activeView === "material" && currentMaterial && (
          <motion.div ref={refContent} key={`mat-${currentMaterial.id}`} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card
              variant="borderless"
              style={{ borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", overflow: "hidden", border: "1px solid #f1f5f9" }}
              styles={{ body: { padding: "32px" } }}
            >
              {/* Card Header with Icon & Title */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px", borderBottom: "1px solid #f1f5f9", paddingBottom: "16px" }}>
                <div style={{ background: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)", width: "40px", height: "40px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#7c3aed" }}>
                  {currentMaterial.url_video ? <PlayCircleOutlined style={{ fontSize: "20px" }} /> : <BookOutlined style={{ fontSize: "20px" }} />}
                </div>
                <div>
                  <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", display: "block" }}>
                    Section {activeMaterialIndex + 1} of {totalSections}
                  </Text>
                  <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>
                    {currentMaterial.title || "Materi Pembelajaran"}
                  </Title>
                </div>
              </div>

              {/* Video Player */}
              {currentMaterial.url_video && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: "28px" }}>
                  <div style={{ position: "relative", width: "100%", maxWidth: "800px", aspectRatio: "16/9", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0", backgroundColor: "#000" }}>
                    <iframe
                      src={getYouTubeEmbedUrl(currentMaterial.url_video) || ""}
                      title="Video Pembelajaran"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    />
                  </div>
                </div>
              )}

              {/* Text content */}
              {currentMaterial.materials && (
                <div
                  className="material-content-body"
                  style={{ fontSize: "15px", lineHeight: "1.8", color: "#475569" }}
                  dangerouslySetInnerHTML={{ __html: currentMaterial.materials }}
                />
              )}
            </Card>
          </motion.div>
        )}

        {/* MATERIAL VIEW - No materials fallback */}
        {activeView === "material" && !currentMaterial && activeSubLesson && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card
              variant="borderless"
              style={{ borderRadius: "20px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)", marginBottom: "24px", border: "1px solid #f1f5f9" }}
              styles={{ body: { padding: "48px", textAlign: "center" } }}
            >
              <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", height: "200px", borderRadius: "16px", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <PlayCircleFilled style={{ fontSize: "54px", color: "rgba(255,255,255,0.7)" }} />
                <Text style={{ color: "#fff", fontWeight: 600 }}>Tidak ada konten untuk materi ini</Text>
              </div>
            </Card>
          </motion.div>
        )}

        {/* PRACTICE VIEW (LATIHAN SOAL) */}
        {activeView === "practice" && activeSubLesson && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* Purple Header Banner */}
            <div style={{
              backgroundColor: "#5B21B6",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              boxShadow: "0 10px 25px rgba(91, 33, 182, 0.2)"
            }}>
              <div>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", fontWeight: 600, display: "block", marginBottom: "4px" }}>
                  Course : {activeLesson?.title || "Java"}
                </Text>
                <Title level={3} style={{ color: "#ffffff", margin: 0, fontWeight: 700 }}>
                  {activeSubLesson?.title}
                </Title>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => setActiveView("material")}
                  style={{
                    color: "#ffffff",
                    fontWeight: 600,
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    padding: "8px 16px",
                    height: "auto"
                  }}
                >
                  Kembali
                </Button>
              </div>
            </div>

            <Row gutter={[24, 24]}>

              {/* Left Column: Studi Kasus and Essays */}
              <Col xs={24} md={activeSubLesson?.codeQuestion ? 11 : 16} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Studi Kasus */}
                {activeSubLesson?.codeQuestion && (
                  <Card
                    ref={refStudiKasus}
                    variant="borderless"
                    style={{
                      borderRadius: "20px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                      background: "linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)",
                      border: "1px solid #ede9fe"
                    }}
                    styles={{ body: { padding: "24px" } }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", borderBottom: "1px solid #eef2f6", paddingBottom: "12px" }}>
                      <ThunderboltOutlined style={{ color: "#7c3aed", fontSize: "20px" }} />
                      <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Exploring - Studi Kasus</Title>
                    </div>

                    <div
                      style={{ fontSize: "14px", lineHeight: "1.7", color: "#475569", overflowX: "auto", maxWidth: "100%" }}
                      dangerouslySetInnerHTML={{ __html: activeSubLesson?.codeQuestion?.code_question || "<p>Tidak ada studi kasus.</p>" }}
                    />
                  </Card>
                )}

                {/* Explaining (Essay) */}
                <Card
                  ref={refEssay}
                  variant="borderless"
                  style={{
                    borderRadius: "20px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    border: "1px solid #f1f5f9"
                  }}
                  styles={{ body: { padding: "24px" } }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <BookOutlined style={{ color: "#059669", fontSize: "20px" }} />
                      <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1e293b" }}>Explaining</Title>
                    </div>
                  </div>

                  <div>
                    {activeSubLesson?.essayQuestions && activeSubLesson.essayQuestions.length > 0 ? (
                      activeSubLesson.essayQuestions.map((eq: any, index: number) => (
                        <div key={eq.id} style={{ marginBottom: "20px" }}>
                          <Text style={{ display: "block", fontSize: "13px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>
                            {index + 1}. <span dangerouslySetInnerHTML={{ __html: eq.essay_question }} style={{ display: "inline" }} />
                          </Text>
                          <TextArea
                            rows={3}
                            placeholder="Type your answer here"
                            value={essayAnswers[eq.id] || ""}
                            onChange={(e) => setEssayAnswers({
                              ...essayAnswers,
                              [eq.id]: e.target.value
                            })}
                            style={{ borderRadius: "10px", fontSize: "13px", border: "1px solid #cbd5e1" }}
                          />
                        </div>
                      ))
                    ) : (
                      <Paragraph type="secondary" style={{ fontSize: "13px" }}>Tidak ada pertanyaan essay untuk materi ini.</Paragraph>
                    )}
                  </div>
                </Card>
              </Col>

              {/* Right Column: Code Editor and Run Box */}
              {activeSubLesson?.codeQuestion && (
                <Col xs={24} md={13} style={{ position: "sticky", top: "24px", alignSelf: "flex-start" }}>
                  <Card
                    ref={refEditor}
                    variant="borderless"
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#1e293b",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                      marginBottom: "20px"
                    }}
                    styles={{ body: { padding: "20px" } }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <Text style={{ color: "#ffffff", fontWeight: 700, fontSize: "15px" }}>Code Editor</Text>
                      <Button
                        ref={refRun}
                        type="primary"
                        icon={<PlayCircleFilled />}
                        loading={isRunning}
                        onClick={handleRunCode}
                        style={{
                          backgroundColor: "#FAAD14",
                          borderColor: "#FAAD14",
                          color: "#1e293b",
                          fontWeight: 700,
                          borderRadius: "9999px",
                          paddingInline: "16px"
                        }}
                      >
                        Run
                      </Button>
                    </div>

                    <div style={{ position: "relative" }}>
                      <textarea
                        value={codeContent}
                        onChange={(e) => {
                          setCodeContent(e.target.value);
                          setIsCodeCorrect(false);
                        }}
                        style={{
                          width: "100%",
                          height: "360px",
                          backgroundColor: "#0f172a",
                          color: "#38bdf8",
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: "14px",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid #334155",
                          resize: "none",
                          lineHeight: "1.6",
                          outline: "none",
                        }}
                        spellCheck={false}
                      />
                    </div>
                  </Card>

                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: "16px",
                      backgroundColor: "#0f172a",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.1)"
                    }}
                    styles={{ body: { padding: "16px" } }}
                  >
                    <Text style={{ color: "#94a3b8", display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>
                      Run Output
                    </Text>
                    <pre style={{
                      margin: 0,
                      color: runOutput.includes("failed") || runOutput.includes("Error") ? "#ef4444" : "#10b981",
                      fontFamily: "'Courier New', Courier, monospace",
                      fontSize: "13px",
                      whiteSpace: "pre-wrap",
                      height: "140px",
                      overflowY: "auto"
                    }}>
                      {runOutput}
                    </pre>
                  </Card>
                </Col>
              )}
            </Row>

            {/* Bottom Submit Test Button specific to practice view */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "32px", width: "100%" }}>
              <Button
                ref={refSubmit}
                type="primary"
                loading={isSubmitting}
                onClick={handleSubmitTest}
                icon={<SendOutlined />}
                size="large"
                style={{
                  background: "#0F766E",
                  border: "none",
                  borderRadius: "9999px",
                  fontWeight: 800,
                  fontSize: "18px",
                  height: "56px",
                  paddingInline: "48px",
                  boxShadow: "0 6px 16px rgba(15, 118, 110, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                SUBMIT TEST
              </Button>
            </div>
          </motion.div>
        )}

        {/* BOTTOM FLOATING CAPSULE NAVIGATION (For Materials only) */}
        {activeView === "material" && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "32px", width: "100%" }}>
            <div ref={refNext} style={{
              display: "flex",
              alignItems: "center",
              background: "#FFFFFF",
              borderRadius: "9999px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
              border: "1px solid #E5E7EB",
              padding: "8px 16px",
              gap: "16px"
            }}>
              <Button
                type="text"
                onClick={handlePrevSection}
                icon={<LeftOutlined />}
                style={{ fontWeight: 700, color: "#4B5563" }}
                disabled={currentIndex === 0 && activeMaterialIndex === 0}
              >
                Prev
              </Button>

              <div style={{ width: "1px", height: "20px", backgroundColor: "#E5E7EB" }} />

              {activeMaterialIndex === currentMaterials.length - 1 && hasTest ? (
                <Button
                  type="primary"
                  onClick={handleNextSection}
                  style={{
                    background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
                    border: "none",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    height: "38px",
                    paddingInline: "20px",
                    boxShadow: "0 4px 12px rgba(13, 148, 136, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Let's Test 🚀
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleNextSection}
                  style={{
                    background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                    border: "none",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    height: "38px",
                    paddingInline: "24px",
                    boxShadow: "0 4px 12px rgba(91, 33, 182, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  Next <RightOutlined />
                </Button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* FLOATING TOUR BUTTON */}
      <div style={{ position: "fixed", right: "16px", bottom: "16px", zIndex: 1000 }} className="floating-tour-btn">
        <Button
          type="primary"
          shape="round"
          icon={<QuestionCircleOutlined />}
          onClick={() => {
            if (activeView === "practice") {
              setTourOpenPractice(true);
            } else {
              if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                setSidebarOpen(true);
                setTimeout(() => setTourOpen(true), 350); // wait for sidebar animation
              } else {
                setTourOpen(true);
              }
            }
          }}
          style={{
            backgroundColor: "#7c3aed",
            borderColor: "#7c3aed",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.4)",
            fontWeight: "bold"
          }}
        >
          Let's Tour
        </Button>
      </div>

      {mounted && (
        <>
          {activeView === "material" && (
            <Tour
              open={tourOpen}
              onClose={() => setTourOpen(false)}
              steps={tourSteps}
              zIndex={1100}
              onChange={(current) => {
                if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                  if (current >= 2) {
                    setSidebarOpen(false);
                  } else {
                    setSidebarOpen(true);
                  }
                }
              }}
            />
          )}
          {activeView === "practice" && (
            <Tour
              open={tourOpenPractice}
              onClose={() => setTourOpenPractice(false)}
              zIndex={1100}
              steps={tourStepsPractice.filter((step) => {
                if (step.title === 'Studi Kasus' && !activeSubLesson?.codeQuestion) return false;
                if (step.title === 'Pertanyaan Esai' && (!activeSubLesson?.essayQuestions || activeSubLesson.essayQuestions.length === 0)) return false;
                if (step.title === 'Code Editor' && !activeSubLesson?.codeQuestion) return false;
                if (step.title === 'Jalankan Kode' && !activeSubLesson?.codeQuestion) return false;
                return true;
              })}
            />
          )}
        </>
      )}

      <style>{`
        @media (max-width: 768px) {
          .material-sidebar {
            position: fixed !important;
            height: calc(100vh - 72px) !important;
            top: 72px !important;
            left: 0 !important;
            z-index: 1050 !important;
            box-shadow: 4px 0 15px rgba(0,0,0,0.1);
          }
          .floating-tour-btn button {
            height: 36px !important;
            font-size: 13px !important;
            padding: 0 12px !important;
          }
          /* Fix tour popup overlapping on small screens */
          .ant-tour, .ant-tour-mask {
            max-width: 90vw !important;
            z-index: 1100 !important;
          }
        }
        @media (min-width: 768px) {
          .sticky-code-editor {
            position: sticky !important;
            top: 140px !important;
            align-self: flex-start !important;
          }
          .floating-tour-btn {
            right: 24px !important;
            bottom: 24px !important;
          }
          .floating-tour-btn button {
            height: 48px !important;
            font-size: 16px !important;
            padding: 0 24px !important;
          }
        }
        .sublesson-item-hover:hover {
          background: #f1f5f9 !important;
        }
        .material-content-body p {
          margin-bottom: 16px;
        }
        .material-content-body code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 13px;
          color: #7c3aed;
        }
        .material-content-body pre {
          background: #1e293b;
          color: #38bdf8;
          padding: 16px;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.6;
        }
        .material-content-body blockquote {
          border-left: 4px solid #7c3aed;
          padding-left: 16px;
          margin: 16px 0;
          color: #64748b;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}

