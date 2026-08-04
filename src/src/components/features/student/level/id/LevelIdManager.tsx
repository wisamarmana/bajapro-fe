"use client";
import React, { useEffect, useState } from "react";
import { Card, Typography, Button, Spin, message } from "antd";
import {
  BookOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { getCourseDetailApi, checkEnrollmentApi, enrollCourseApi, getStudentDashboardApi } from "@/src/actions/student/studentApi";
import { useRouter, useParams } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants: Variants = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

// Icon and color per level index
const levelIcons = ["🌿", "🚀", "🏔️", "⚡", "🌟"];
const levelIconBgs = ["#10B981", "#5B21B6", "#F59E0B", "#3B82F6", "#EC4899"];

export default function LevelIdManager() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progressVal, setProgressVal] = useState<number>(0);
  const [studentId, setStudentId] = useState<number>(5);

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      setStudentId(user.id);

      const fetchData = async () => {

        try {
          const [courseData, enrolled, dashResponse] = await Promise.all([
            getCourseDetailApi(courseId),
            checkEnrollmentApi(courseId),
            getStudentDashboardApi(),
          ]);

          setCourse(courseData);
          setIsEnrolled(enrolled);

          const dashData =
            dashResponse?.data ??
            dashResponse ??
            {};

          const lessonHistory = Array.isArray(dashData.lessonHistory)
            ? dashData.lessonHistory
            : Array.isArray(dashData.lesson_history)
              ? dashData.lesson_history
              : [];

          const enrolledCourse = lessonHistory.find(
            (item: any) =>
              Number(item.course_id ?? item.courseId) === Number(courseId)
          );

          if (enrolledCourse) {
            setProgressVal(
              Number(
                enrolledCourse.progressPercent ??
                enrolledCourse.progress_percent ??
                0
              )
            );
          }
        } catch (e) {
          console.error(e);
          messageApi.error("Failed to load course details");
        } finally {
          setLoading(false);
        }
      };

      if (courseId) fetchData();
    }
  }, [courseId, user?.id]);

  const handleStartLesson = async (
    levelId: number,
    status: "completed" | "active" | "locked"
  ) => {
    if (status === "locked") {
      messageApi.warning("Level is locked! Please complete previous levels first.");
      return;
    }
    if (!isEnrolled) {
      setEnrolling(true);
      try {
        await enrollCourseApi(courseId);
        setIsEnrolled(true);
        messageApi.success("Successfully enrolled!");
        router.push(`/student/material/${courseId}/${levelId}?fromLevel=true`);
      } catch (e) {
        console.error(e);
        messageApi.error("Failed to enroll");
      } finally {
        setEnrolling(false);
      }
    } else {
      router.push(`/student/material/${courseId}/${levelId}?fromLevel=true`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Course not found</div>;
  }

  return (
    <>
      {contextHolder}
      <style>{`
        .level-card-hover:hover { transform: translateY(-5px) !important; box-shadow: 0 16px 36px rgba(91,33,182,0.12) !important; }
        /* Dashed center line */
        .level-center-line { border-left: 3px dashed #C4B5FD; }
      `}</style>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: "960px", margin: "0 auto" }}
      >
        {/* Back + Heading */}
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <div className="flex justify-start mb-4">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/student/course")}
              style={{ color: "#6B7280", fontWeight: 600 }}
            >
              Kembali ke Daftar Course
            </Button>
          </div>
          <Title level={2} style={{ fontWeight: 800, margin: "0 0 10px 0", fontSize: "clamp(24px, 5vw, 36px)", color: "#1F2937" }}>
            <span style={{ color: "#5B21B6" }}>Start</span> Your Adventure{" "}
            <span style={{ color: "#F59E0B" }}>Now!</span>
          </Title>
          <Paragraph style={{ fontSize: "14px", color: "#6B7280", marginBottom: 0, maxWidth: "500px", margin: "0 auto" }}>
            Levels serve as milestones that learners can progress through, providing structure, motivation, and rewards.
          </Paragraph>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* ── Dashed center line (desktop only) ── */}
          <div
            className="level-center-line hidden md:block absolute top-0 bottom-0"
            style={{ left: "50%", transform: "translateX(-50%)", zIndex: 0, width: 0 }}
          />
          {/* ── Mobile left rail ── */}
          <div
            className="block md:hidden absolute top-0 bottom-0 level-center-line"
            style={{ left: "18px", width: 0, zIndex: 0 }}
          />

          {course.levels.map((level: any, index: number) => {
            // Derive status based on progressPercent dynamically
            let status: "completed" | "active" | "locked" = "locked";
            const percentPerLevel = 100 / course.levels.length;

            if (!isEnrolled || progressVal === 0) {
              status = index === 0 ? "active" : "locked";
            } else if (progressVal >= (index + 1) * percentPerLevel - 0.1) {
              // Using -0.1 to handle small rounding errors
              status = "completed";
            } else if (progressVal >= index * percentPerLevel - 0.1) {
              status = "active";
            } else {
              status = "locked";
            }

            const isLeft = index % 2 === 0; // even → left on desktop

            const cfg = {
              completed: {
                badgeBg: "#D1FAE5", badgeColor: "#065F46", badgeLabel: "Selesai",
                badgeIcon: <CheckCircleOutlined />,
                dotColor: "#10B981", dotBorder: "#10B981",
                cardBorder: "1.5px solid #10B981", cardBg: "#FFFFFF",
                titleColor: "#1F2937", opacity: 1,
                outerSymbol: "{ }",
              },
              active: {
                badgeBg: "#FEF3C7", badgeColor: "#92400E", badgeLabel: "Sedang Aktif",
                badgeIcon: <ThunderboltOutlined />,
                dotColor: "#F59E0B", dotBorder: "#F59E0B",
                cardBorder: "2px solid #F59E0B", cardBg: "#FFFFFF",
                titleColor: "#5B21B6", opacity: 1,
                outerSymbol: "⭐",
              },
              locked: {
                badgeBg: "#F3F4F6", badgeColor: "#9CA3AF", badgeLabel: "Terkunci",
                badgeIcon: <LockOutlined />,
                dotColor: "#FFFFFF", dotBorder: "#C4B5FD",
                cardBorder: "1px solid #E5E7EB", cardBg: "#FAFAFA",
                titleColor: "#6B7280", opacity: 0.8,
                outerSymbol: ">_",
              },
            }[status];

            const iconBg = levelIconBgs[index % levelIconBgs.length];
            const icon = levelIcons[index % levelIcons.length];

            const cardEl = (
              <motion.div
                variants={itemVariants}
                whileHover={status !== "locked" ? { y: -5 } : {}}
                style={{ opacity: cfg.opacity, width: "100%" }}
                className="level-card-hover"
              >
                <Card
                  variant="borderless"
                  style={{
                    borderRadius: "20px",
                    border: cfg.cardBorder,
                    background: cfg.cardBg,
                    boxShadow:
                      status === "active"
                        ? "0 12px 32px rgba(245,158,11,0.12)"
                        : "0 4px 16px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease",
                    overflow: "visible",
                  }}
                  styles={{ body: { padding: "20px" } }}
                >
                  {/* Card Header: Icon + Badge */}
                  <div className="flex items-start justify-between mb-3">
                    {/* Colored icon circle */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: status === "locked" ? "#E5E7EB" : iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        flexShrink: 0,
                        boxShadow: status !== "locked" ? `0 6px 16px ${iconBg}40` : "none",
                      }}
                    >
                      {icon}
                    </div>
                    {/* Status badge */}
                    <span
                      style={{
                        backgroundColor: cfg.badgeBg,
                        color: cfg.badgeColor,
                        padding: "4px 10px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        border: `1px solid ${cfg.badgeColor}30`,
                      }}
                    >
                      {cfg.badgeIcon} {cfg.badgeLabel}
                    </span>
                  </div>

                  {/* Level name */}
                  <Title
                    level={4}
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "20px",
                      fontWeight: 800,
                      color: cfg.titleColor,
                    }}
                  >
                    {level.level_name}
                  </Title>

                  {/* Description */}
                  <Paragraph
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.6",
                      marginBottom: "14px",
                      color: "#6B7280",
                    }}
                  >
                    {level.description}
                  </Paragraph>

                  {/* Stats */}
                  <div className="flex gap-5 mb-4">
                    <div className="flex items-center gap-1.5">
                      <BookOutlined style={{ color: status === "locked" ? "#9CA3AF" : "#5B21B6", fontSize: "13px" }} />
                      <Text style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>
                        {level.lessonCount} Lesson
                      </Text>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOutlined style={{ color: status === "locked" ? "#9CA3AF" : "#5B21B6", fontSize: "13px" }} />
                      <Text style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600 }}>
                        {level.subLessonCount} Sub Lesson
                      </Text>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {status !== "locked" && (
                    <Button
                      type="primary"
                      block
                      loading={enrolling}
                      onClick={() => handleStartLesson(level.id, status)}
                      style={{
                        background: status === "completed" ? "#10B981" : "#5B21B6",
                        borderRadius: "10px",
                        fontWeight: 700,
                        height: "40px",
                        border: "none",
                      }}
                    >
                      {status === "completed" ? "Ulangi Materi" : "Lanjutkan Belajar"}
                    </Button>
                  )}
                </Card>
              </motion.div>
            );

            return (
              <div key={level.id} className="relative flex mb-12">
                {/* ─────── MOBILE LAYOUT ─────── */}
                <div className="flex w-full md:hidden pl-12">
                  {/* Mobile dot */}
                  <div
                    className="absolute"
                    style={{
                      left: "9px",
                      top: "28px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: cfg.dotColor,
                      border: `4px solid ${cfg.dotBorder}`,
                      boxShadow:
                        status === "active" ? "0 0 12px rgba(245,158,11,0.5)" : "none",
                      zIndex: 2,
                    }}
                  />
                  {cardEl}
                </div>

                {/* ─────── DESKTOP ZIGZAG LAYOUT ─────── */}
                <div className="hidden md:flex w-full items-center">
                  {/* Left column */}
                  <div className="w-[calc(50%-32px)] flex justify-end pr-0">
                    {isLeft ? (
                      <div style={{ width: "100%", maxWidth: "400px" }}>
                        {/* Outer symbol */}
                        <div
                          style={{
                            marginBottom: "8px",
                            textAlign: "right",
                            fontSize: "18px",
                            color: status === "active" ? "#F59E0B" : "#9CA3AF",
                            paddingRight: "8px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                          }}
                        >
                          {cfg.outerSymbol}
                        </div>
                        {cardEl}
                      </div>
                    ) : (
                      /* Dashed connector line to the right dot */
                      <div style={{ flex: 1, borderBottom: "2px dashed #C4B5FD", marginBottom: "4px" }} />
                    )}
                  </div>

                  {/* Center dot */}
                  <div
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: cfg.dotColor,
                      border: `4px solid ${cfg.dotBorder}`,
                      zIndex: 2,
                      boxShadow:
                        status === "active" ? "0 0 16px rgba(245,158,11,0.6)" : "0 2px 6px rgba(0,0,0,0.08)",
                      margin: "0 6px",
                    }}
                  />

                  {/* Right column */}
                  <div className="w-[calc(50%-32px)] flex justify-start pl-0">
                    {!isLeft ? (
                      <div style={{ width: "100%", maxWidth: "400px" }}>
                        {/* Outer symbol */}
                        <div
                          style={{
                            marginBottom: "8px",
                            textAlign: "left",
                            fontSize: "18px",
                            color: status === "active" ? "#F59E0B" : "#9CA3AF",
                            paddingLeft: "8px",
                            fontFamily: "monospace",
                            fontWeight: 700,
                          }}
                        >
                          {cfg.outerSymbol}
                        </div>
                        {cardEl}
                      </div>
                    ) : (
                      /* Dashed connector line to the left dot */
                      <div style={{ flex: 1, borderBottom: "2px dashed #C4B5FD", marginBottom: "4px" }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

