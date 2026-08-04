"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Spin, Button, Empty, Modal, Avatar } from "antd";
import { PlayCircleOutlined, BookOutlined, ClockCircleOutlined, TrophyOutlined, RightOutlined, FireFilled, SafetyOutlined } from "@ant-design/icons";
import { getStudentDashboardApi } from "@/src/actions/student/studentApi";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function DashboardManager() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<{ name: string, id: number }>({ name: "Pelajar", id: 5 });
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      setProfileUser({ name: authUser.name, id: authUser.id });

      const fetchUserAndData = async () => {
        try {
          const res = await getStudentDashboardApi(authUser.id);
          setData(res);
          if (res.enrolledCount === 0) {
            setShowWelcomeModal(true);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };

      fetchUserAndData();
    }
  }, [authUser?.id, authUser?.name]);

  if (loading || authLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  // Formatting for number commas
  const formatScore = (num: number) => {
    if (!num) return "0";
    return num.toLocaleString("id-ID");
  };

  return (
    <>
      <AnimatePresence>
        {showWelcomeModal && (
          <Modal
            open={showWelcomeModal}
            footer={null}
            closable={false}
            centered
            width={400}
            styles={{ body: { padding: "32px", textAlign: "center", borderRadius: "16px" } }}
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚀</div>
              <Title level={3} style={{ fontWeight: 800 }}>Mulai Petualanganmu!</Title>
              <Text type="secondary" style={{ display: "block", marginBottom: "24px" }}>
                Kamu belum mendaftar di kelas manapun. Yuk, temukan kursus yang menarik dan mulai belajar sekarang!
              </Text>
              <Button
                type="primary"
                size="large"
                block
                style={{ backgroundColor: "#5B21B6", borderRadius: "8px", fontWeight: 600, border: "none" }}
                onClick={() => {
                  setShowWelcomeModal(false);
                  router.push("/student/course");
                }}
              >
                Browse Course
              </Button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: "1200px", margin: "0 auto" }}
      >
        <Row gutter={[24, 24]}>
          {/* Left Side: Welcome, Stats, and History */}
          <Col xs={24} lg={16}>
            {/* Welcome Card */}
            <motion.div variants={itemVariants} style={{ marginBottom: "24px", padding: "32px", borderRadius: "24px", background: "linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(109, 40, 217, 0.05)", boxShadow: "0 8px 24px rgba(109, 40, 217, 0.04)" }}>
              <div style={{ maxWidth: "60%", zIndex: 1 }}>
                <Title level={2} style={{ margin: "0 0 12px 0", fontWeight: 700, fontSize: "26px", color: "#1F2937" }}>
                  Selamat Datang,<br /> <span style={{ color: "#6d28d9", fontSize: "30px", fontWeight: 800 }}>{profileUser?.name ? profileUser.name.split(" ")[0] : "Pelajar"}!</span> <span className="wave-animation" role="img" aria-label="wave" style={{ display: "inline-block", fontSize: "28px" }}>👋</span>
                </Title>
                <Text style={{ color: "#6B7280", fontSize: "14px", display: "block", marginBottom: "24px", lineHeight: "1.5" }}>
                  Mulai belajar Java dari dasar, pahami setiap konsep melalui materi dan kembangkan kemampuan codingmu langkah demi langkah.
                </Text>
                <Button
                  type="primary"
                  style={{ backgroundColor: "#6d28d9", borderRadius: "20px", fontWeight: 600, border: "none", padding: "0 24px", height: "42px", fontSize: "14px", boxShadow: "0 4px 12px rgba(109, 40, 217, 0.2)" }}
                  onClick={() => router.push("/student/course")}
                >
                  Lanjut Belajar <RightOutlined style={{ fontSize: "12px", marginLeft: "4px" }} />
                </Button>
              </div>
              <div style={{ position: "absolute", right: "10px", bottom: "-10px", width: "260px", height: "220px", zIndex: 0 }}>
                <Image src="/assets/dashboard.png" alt="Illustration" layout="fill" objectFit="contain" />
              </div>
            </motion.div>
            {/* Stats Row */}
            <motion.div variants={itemVariants} style={{ marginBottom: "28px" }}>
              <Row gutter={[16, 16]}>
                {/* Enrolled Course */}
                <Col xs={24} sm={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      height: '100%',
                      border: 'none'
                    }}
                    styles={{ body: { padding: "20px" } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: "16px" }}>
                      <div style={{ backgroundColor: "#f5f3ff", padding: "12px", borderRadius: "14px", color: "#6d28d9", display: 'flex' }}>
                        <BookOutlined style={{ fontSize: "20px" }} />
                      </div>
                      <div style={{ color: "#d1d5db", fontSize: "18px", cursor: "pointer", lineHeight: "1" }}>•••</div>
                    </div>
                    <Text style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", display: "block", marginBottom: "4px" }}>Enrolled Course</Text>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#6d28d9", fontSize: "24px" }}>
                      {data?.enrolledCount || 0} <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", marginLeft: "4px" }}>active</span>
                    </Title>
                  </Card>
                </Col>

                {/* Materials Done */}
                <Col xs={24} sm={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      height: '100%',
                      border: 'none'
                    }}
                    styles={{ body: { padding: "20px" } }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: "16px" }}>
                      <div style={{ backgroundColor: "#ecfdf5", padding: "12px", borderRadius: "14px", color: "#10b981", display: 'flex' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ color: "#d1d5db", fontSize: "18px", cursor: "pointer", lineHeight: "1" }}>•••</div>
                    </div>
                    <Text style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", display: "block", marginBottom: "4px" }}>Materials Done</Text>
                    <Title level={2} style={{ margin: 0, fontWeight: 800, color: "#10b981", fontSize: "24px" }}>
                      {data?.materialsCompleted || 0} <span style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", marginLeft: "2px" }}>/ {data?.materialsTotal || 0}</span>
                    </Title>
                  </Card>
                </Col>

                {/* Overall Progress */}
                <Col xs={24} sm={8}>
                  <Card
                    variant="borderless"
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#ffffff",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
                      height: '100%',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    styles={{ body: { padding: "20px", width: '100%', display: 'flex', justifyContent: 'center' } }}
                  >
                    <Progress
                      type="circle"
                      percent={data?.overallProgress || 0}
                      strokeColor="#6d28d9"
                      railColor="#f3f4f6"
                      strokeWidth={10}
                      size={90}
                      format={(percent) => (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: "4px" }}>
                          <span style={{ fontSize: "20px", fontWeight: 800, color: "#6d28d9", lineHeight: "1" }}>{percent}%</span>
                          <span style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", marginTop: "2px" }}>Progres</span>
                        </div>
                      )}
                    />
                  </Card>
                </Col>
              </Row>
            </motion.div>

            {/* Lesson History Section */}
            <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', marginBottom: "20px", gap: "12px", marginTop: "16px" }}>
              <div style={{ background: "#f5f3ff", borderRadius: "50%", padding: "6px", display: "flex", border: "1px solid #ede9fe" }}>
                <PlayCircleOutlined style={{ color: "#6d28d9", fontSize: "18px" }} />
              </div>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#1F2937" }}>Lesson History</Title>
            </motion.div>

            <motion.div variants={containerVariants}>
              <Row gutter={[24, 24]}>
                {data?.latestProgress?.length > 0 ? (
                  data.latestProgress.map((history: any) => {
                    const progressPct = 100; // Since it's completed sublesson
                    return (
                      <Col xs={24} sm={12} key={history.id}>
                        <motion.div variants={itemVariants} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400 }}>
                          <Card
                            variant="borderless"
                            style={{
                              borderRadius: "20px",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                              backgroundColor: "#FFFFFF",
                              overflow: "hidden"
                            }}
                            styles={{ body: { padding: "16px" } }}
                          >
                            {history.course?.img_thumbnail ? (
                              <div style={{
                                width: '100%',
                                height: '130px',
                                borderRadius: '12px',
                                background: `url(${history.course.img_thumbnail.startsWith('/') || history.course.img_thumbnail.startsWith('http') ? history.course.img_thumbnail : `/uploads/courses/${history.course.img_thumbnail}`}) center/cover no-repeat`,
                                backgroundColor: '#F3F4F6',
                                marginBottom: '16px'
                              }} />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '130px',
                                background: 'linear-gradient(135deg, #111827 0%, #374151 100%)',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {/* Dummy laptop image for placeholder */}
                                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3" alt="laptop" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                              </div>
                            )}
                            <span style={{
                              background: '#ecfdf5',
                              color: '#10b981',
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '9px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              display: 'inline-block',
                              marginBottom: '8px'
                            }}>
                              {history.subLesson?.lesson?.level?.level_name || history.subLesson?.lesson?.level?.levelName || "Easy"}
                            </span>
                            <Title level={4} style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: 800, color: "#1F2937", lineHeight: "1.4", height: "38px", overflow: "hidden" }}>
                              {history.subLesson?.title || "Materi Pembelajaran"}
                            </Title>

                            <div style={{ marginBottom: "16px" }}>
                              <Progress
                                percent={progressPct}
                                strokeColor="linear-gradient(90deg, #6d28d9 0%, #a78bfa 100%)"
                                railColor="#f3f4f6"
                                showInfo={false}
                                size="small"
                                style={{ margin: 0 }}
                              />
                              <Text style={{ fontSize: "10px", fontWeight: 700, color: "#6B7280", marginTop: "4px", display: "block" }}>
                                100% Selesai
                              </Text>
                            </div>

                            <Button
                              type="primary"
                              block
                              size="large"
                              style={{
                                background: "linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)",
                                borderRadius: "10px",
                                fontWeight: 600,
                                border: "none",
                                height: "38px",
                                boxShadow: "0 4px 12px rgba(109, 40, 217, 0.2)"
                              }}
                              onClick={() => router.push(`/student/material/${history.courseId}/${history.subLesson?.lesson?.levelId || 1}?subLessonId=${history.subLessonId}`)}
                            >
                              Ulas Kembali
                            </Button>
                          </Card>
                        </motion.div>
                      </Col>
                    );
                  })
                ) : (
                  <Empty description="No lesson history" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Row>
            </motion.div>
          </Col>

          {/* Right Side: Achievement and Leaderboard */}
          <Col xs={24} lg={8}>
            {/* Achievement Card */}
            <motion.div variants={itemVariants} whileHover={{ y: -4 }} style={{ marginBottom: "24px", marginTop: "0" }}>
              <Card
                variant="borderless"
                style={{
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                  color: "#fff",
                  boxShadow: "0 8px 20px rgba(245, 158, 11, 0.25)",
                }}
                styles={{ body: { padding: "24px" } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                  <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.4)" }}>
                      <TrophyOutlined style={{ fontSize: "24px", color: "#fff" }} />
                    </div>
                  </motion.div>
                  <div>
                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#fff" }}>Achievement</Title>
                    <Text style={{ fontSize: "13px", color: "rgba(255,255,255,0.9)" }}>Kamu luar biasa! Pertahankan.</Text>
                  </div>
                </div>

                {/* Badge Display */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#ea580c", padding: "16px 20px", borderRadius: "20px", marginBottom: "24px", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)" }}>
                  <div>
                    <Text style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", display: "block", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>Badge</Text>
                    <Title level={3} style={{ margin: 0, fontWeight: 800, color: "#FFFFFF" }}>
                      {data?.achievement?.badge || "Warrior"}
                    </Title>
                  </div>
                  {/* Simulated Badge Icon */}
                  <div style={{ width: "56px", height: "56px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    {data?.achievement?.badgeImage ? (
                      <img src={data.achievement.badgeImage} alt="Badge" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    ) : (
                      <img src="/assets/gamification/lv 3.png" alt="Badge" style={{ width: "120%", height: "120%", objectFit: "contain", transform: "scale(1.3)" }} onError={(e: any) => e.target.style.display = 'none'} />
                    )}
                  </div>
                </div>

                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <div style={{ background: "#ef4444", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrophyOutlined style={{ color: "#fff", fontSize: "14px" }} />
                      </div>
                      <div>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", display: 'block', textTransform: "uppercase", fontWeight: 700 }}>Rank</Text>
                        <Text style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>
                          {data?.achievement?.rank || "10"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ background: "rgba(255,255,255,0.15)", padding: "12px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <div style={{ background: "#3b82f6", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrophyOutlined style={{ color: "#fff", fontSize: "14px" }} />
                      </div>
                      <div>
                        <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "10px", display: 'block', textTransform: "uppercase", fontWeight: 700 }}>Score</Text>
                        <Text style={{ color: "#fff", fontWeight: 800, fontSize: "16px" }}>
                          {formatScore(data?.achievement?.totalScore || 14250)}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>
            </motion.div>

            {/* Leaderboard Card */}
            <motion.div variants={itemVariants}>
              <Card
                variant="borderless"
                style={{ borderRadius: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.03)", border: "none" }}
                styles={{ body: { padding: "24px" } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: "24px" }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: "#fef3c7", padding: "8px", borderRadius: "50%", display: "flex" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19V20H20V19H4ZM4 21V22H20V21H4ZM9 9V17H15V9H9ZM10 10H14V16H10V10ZM16 11V17H20V11H16ZM17 12H19V16H17V12ZM4 13V17H8V13H4ZM5 14H7V16H5V14Z" fill="#f59e0b" />
                        <path d="M12 2L15 7H9L12 2Z" fill="#f59e0b" />
                      </svg>
                    </div>
                    <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1F2937" }}>Leaderboard</Title>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', color: "#9ca3af" }}>
                    <Text style={{ fontSize: "12px", fontWeight: 600, color: "#9ca3af", marginRight: "4px" }}>Mingguan</Text>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {data?.top5Leaderboard && data.top5Leaderboard.length > 0 ? (
                    data.top5Leaderboard.slice(0, 5).map((item: any, index: number) => {
                      const getInitials = (name: string) => {
                        if (!name) return "";
                        const parts = name.trim().split(" ");
                        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
                        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                      };
                      const isMe = item.id === profileUser.id;
                      const trophyColors = ["#f59e0b", "#94a3b8", "#d97706"];
                      const isTop3 = index < 3;

                      return (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: isTop3 ? "12px" : "8px 12px",
                            borderRadius: '16px',
                            border: isMe ? '1px solid rgba(109, 40, 217, 0.2)' : (isTop3 ? '1px solid #f9fafb' : 'none'),
                            backgroundColor: isMe ? 'rgba(109, 40, 217, 0.05)' : (isTop3 ? '#faf5ff' : '#FFFFFF'),
                            transition: 'all 0.3s'
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0, paddingRight: "12px" }}>
                            <div style={{ width: "24px", textAlign: "center" }}>
                              {isTop3 ? (
                                <div style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  background: trophyColors[index],
                                  color: "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  boxShadow: `0 2px 4px ${trophyColors[index]}40`
                                }}>
                                  {index + 1}
                                </div>
                              ) : (
                                <div style={{
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  background: "#f1f5f9",
                                  color: "#94a3b8",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "10px",
                                  fontWeight: 800
                                }}>
                                  {index + 1}
                                </div>
                              )}
                            </div>

                            <Avatar size={isTop3 ? 40 : 32} style={{ backgroundColor: isMe ? '#6d28d9' : '#f1f5f9', color: isMe ? '#fff' : '#64748b', fontWeight: 800 }}>
                              {getInitials(item.name)}
                            </Avatar>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <Text style={{ fontWeight: 800, fontSize: "14px", display: "block", color: "#1e293b", marginBottom: isTop3 ? "2px" : "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {item.name}
                              </Text>
                              {isTop3 && (
                                <Text style={{ fontWeight: 800, fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                  {index === 0 ? "Top Learner" : "Total Score"}
                                </Text>
                              )}
                            </div>
                          </div>

                          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
                            <Text style={{ fontWeight: 800, color: "#1e293b", fontSize: isTop3 ? "18px" : "15px", display: "block", lineHeight: "1", whiteSpace: "nowrap" }}>
                              {formatScore(item.score)}
                            </Text>
                            {isTop3 && index === 0 && <Text style={{ fontWeight: 800, color: "#9ca3af", fontSize: "9px", marginTop: "4px" }}>PTS</Text>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <Empty description="Belum ada data leaderboard" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
                </div>

                {/* View Leaderboard Link */}
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <Button
                    type="text"
                    onClick={() => router.push("/student/leaderboard")}
                    style={{ color: "#6d28d9", fontWeight: 800, fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "8px", background: "#f5f3ff", borderRadius: "16px", padding: "8px 24px", height: "40px" }}
                  >
                    See Full Leaderboard <RightOutlined style={{ fontSize: "12px" }} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>
        <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        .wave-animation {
          animation: wave 2.5s infinite;
          transform-origin: 70% 70%;
        }
      `}</style>
      </motion.div>
    </>
  );
}

