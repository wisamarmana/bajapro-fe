"use client";

import React, { useEffect, useState } from "react";
import { Typography, Select, Radio, Input, Table, Avatar, Tag, Spin } from "antd";
import { SearchOutlined, TrophyFilled } from "@ant-design/icons";
import { useLeaderboard } from "@/src/hooks/leaderboard/useLeaderboard";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text } = Typography;

const getInitials = (name: string) => {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function LeaderboardManager() {
  const { user } = useAuth();
  const [loggedInUserId, setLoggedInUserId] = useState<number | undefined>();
  const [studentName, setStudentName] = useState<string>("Pelajar");
  const [userClassId, setUserClassId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (user) {
      setLoggedInUserId(Number(user.id));
      setStudentName(user.name || "Pelajar");
      setUserClassId(user.class?.id ? Number(user.class.id) : null);
    }
  }, [user]);

  const {
    courses, studentsRank, loading,
    selectedCourse, setSelectedCourse,
    rankingType, setRankingType,
    setSelectedClass
  } = useLeaderboard();

  const courseList = Array.isArray(courses) ? courses : [];
  const rankingList = Array.isArray(studentsRank) ? studentsRank : [];

  // When user switches to "class" mode, auto-set their class
  useEffect(() => {
    if (rankingType === "class" && userClassId) {
      setSelectedClass(userClassId);
    } else if (rankingType === "global") {
      setSelectedClass(null);
    }
  }, [rankingType, userClassId]);

  const top1 = rankingList[0];
  const top2 = rankingList[1];
  const top3 = rankingList[2];

  const tableData = rankingList
    .map((item: any, index: number) => ({ ...item, rank: index + 1 }))
    .slice(3)
    .filter((item: any) => item.name?.toLowerCase().includes(searchText.toLowerCase()));

  const hasClass = !!userClassId;

  // --- Podium Card ---
  const renderPodiumCard = (student: any, rank: number) => {
    if (!student) return null;
    const isCenter = rank === 1;
    const colors: Record<number, { bg: string; border: string; badge: string; rankBg: string }> = {
      1: { bg: "#F5F3FF", border: "#4F46E5", badge: "#4F46E5", rankBg: "#4F46E5" },
      2: { bg: "#FFFBEB", border: "#F59E0B", badge: "#F59E0B", rankBg: "#F59E0B" },
      3: { bg: "#F7FEE7", border: "#84CC16", badge: "#84CC16", rankBg: "#84CC16" },
    };
    const c = colors[rank];
    const avatarSize = isCenter ? 90 : 70;

    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: isCenter ? 0 : 40, position: "relative", flex: "0 0 auto", minWidth: isCenter ? 200 : 170 }}>
        {/* Rank Badge */}
        <div style={{
          position: "absolute", top: isCenter ? -8 : 32, right: isCenter ? 10 : 0,
          backgroundColor: c.rankBg, color: "#fff", fontWeight: 800, fontSize: 16,
          width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 2
        }}>
          #{rank}
        </div>
        {/* Card */}
        <div style={{
          backgroundColor: "#fff", border: `3px solid ${c.border}`, borderRadius: 20,
          padding: "28px 20px 20px", textAlign: "center", width: isCenter ? 200 : 170,
          boxShadow: "0 8px 30px rgba(0,0,0,0.08)", position: "relative"
        }}>
          <Avatar size={avatarSize} style={{
            backgroundColor: c.bg, color: c.badge, fontWeight: 800,
            fontSize: avatarSize * 0.35, border: `3px solid ${c.border}`, marginBottom: 12
          }}>
            {getInitials(student.name)}
          </Avatar>
          <div style={{ fontWeight: 700, fontSize: isCenter ? 16 : 14, color: "#1E1B4B", marginBottom: 4, lineHeight: 1.3, marginTop: isCenter ? 8 : 0 }}>
            {student.name}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginBottom: 8 }}>
            <span style={{ fontWeight: 900, fontSize: isCenter ? 28 : 22, color: c.badge }}>{student.totalScore}</span>
            <span style={{ fontWeight: 700, fontSize: 11, color: "#9CA3AF" }}>PTS</span>
          </div>
          <div style={{
            backgroundColor: c.badge, color: "#fff", fontSize: 11, fontWeight: 700,
            padding: "4px 14px", borderRadius: 20, display: "inline-flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
          }}>
            {student.badgeImage ? (
              <img src={student.badgeImage} alt="badge" style={{ width: 14, height: 14, objectFit: "contain" }} />
            ) : (
              <span>🏅</span>
            )}
            {student.badgeName || "No Badge"}
          </div>

          {/* Detail Scores */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginTop: 14, paddingTop: 12, borderTop: "1px dashed #E5E7EB", width: "100%", gap: 4
          }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Read</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.readingScore || 0}</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: "#E5E7EB" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Explore</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.codingScore || 0}</span>
            </div>
            <div style={{ width: 1, height: 16, backgroundColor: "#E5E7EB" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Essay</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#1F2937" }}>{student.essayScore || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Table Columns ---
  const columns = [
    {
      title: "RANK", dataIndex: "rank", key: "rank", width: 70, align: "center" as const,
      render: (rank: number) => <span style={{ fontWeight: 700, color: "#6B7280", fontSize: 15 }}>{rank}</span>
    },
    {
      title: "NAMA SISWA", key: "name", width: 250,
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar size={36} style={{
            backgroundColor: record.rank % 2 === 0 ? "#FDE68A" : "#C7D2FE",
            color: record.rank % 2 === 0 ? "#92400E" : "#3730A3", fontWeight: 700, fontSize: 13
          }}>{getInitials(record.name)}</Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#1E1B4B", fontSize: 14 }}>{record.name}</div>
          </div>
          {record.id === loggedInUserId && <span style={{ fontSize: 14 }}>⭐</span>}
        </div>
      )
    },
    {
      title: "BADGE", key: "badge",
      render: (_: any, record: any) => (
        <Tag style={{
          backgroundColor: record.badgeName === "No Badge" ? "#F3F4F6" : "#EDE9FE",
          color: record.badgeName === "No Badge" ? "#6B7280" : "#5B21B6",
          border: "none", borderRadius: 6, fontWeight: 700, fontSize: 11, padding: "4px 10px",
          display: "inline-flex", alignItems: "center", gap: 6
        }}>
          {record.badgeImage ? (
            <img src={record.badgeImage} alt="badge" style={{ width: 16, height: 16, objectFit: "contain" }} />
          ) : (
            <span>🏅</span>
          )}
          {record.badgeName?.toUpperCase() || "NO BADGE"}
        </Tag>
      )
    },
    { title: "READING", dataIndex: "readingScore", key: "readingScore", align: "center" as const, width: 90, render: (v: number) => <span style={{ color: "#374151", fontWeight: 500 }}>{v}</span> },
    { title: "EXPLORING", dataIndex: "codingScore", key: "codingScore", align: "center" as const, width: 95, render: (v: number) => <span style={{ color: "#374151", fontWeight: 500 }}>{v}</span> },
    { title: "ESSAY", dataIndex: "essayScore", key: "essayScore", align: "center" as const, width: 90, render: (v: number) => <span style={{ color: "#374151", fontWeight: 500 }}>{v}</span> },
    {
      title: "TOTAL SCORE", dataIndex: "totalScore", key: "totalScore", align: "center" as const, width: 100,
      render: (score: number) => <span style={{ fontWeight: 800, fontSize: 16, color: "#4F46E5" }}>{score}</span>
    },
  ];

  return (
    <div style={{ minHeight: "100vh", maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Pastel gradient background */}
      <style>{`
        .student-leaderboard-wrap {
          background: linear-gradient(160deg, #ffffff 0%, #EDE9FE 30%, #FEF3C7 60%, #F0FDF4 100%);
          padding: 32px 24px 48px;
          border-radius: 24px;
          min-height: 100vh;
        }
        .lb-table .ant-table { background: transparent !important; }
        .lb-table .ant-table-thead > tr > th {
          background: transparent !important; border-bottom: 2px solid #E5E7EB !important;
          color: #6B7280 !important; font-weight: 700 !important; font-size: 11px !important;
          text-transform: uppercase !important; letter-spacing: 0.5px !important;
        }
        .lb-table .ant-table-tbody > tr > td { border-bottom: 1px solid #F3F4F6 !important; }
        .lb-table .ant-table-tbody > tr:hover > td { background: #F5F3FF !important; }
        .lb-table .ant-pagination-item-active {
          background: #4F46E5 !important; border-color: #4F46E5 !important;
        }
        .lb-table .ant-pagination-item-active a { color: #fff !important; }
        .lb-ranking-toggle .ant-radio-button-wrapper-checked {
          background-color: #4F46E5 !important; border-color: #4F46E5 !important;
          color: #FFFFFF !important; font-weight: 700 !important;
        }
        .lb-ranking-toggle .ant-radio-button-wrapper {
          border: none !important; background-color: transparent !important;
          color: #4B5563 !important; font-weight: 600; height: 38px; line-height: 38px;
          border-radius: 10px !important; padding: 0 24px; transition: all 0.3s;
        }
        .lb-ranking-toggle .ant-radio-button-wrapper:not(:first-child)::before { display: none !important; }
        .lb-ranking-toggle .ant-radio-button-wrapper:hover { color: #4F46E5 !important; }
        .podium-container { display: flex; justify-content: center; align-items: flex-end; gap: 24px; margin: 40px 0 48px; padding: 24px 8px 0; }
        @media (max-width: 640px) {
          .podium-container { gap: 8px; overflow-x: auto; justify-content: flex-start; padding-bottom: 16px; }
          .podium-container > div { min-width: 140px !important; }
          .podium-container > div > div:last-child { width: 140px !important; padding: 16px 8px 12px !important; }
        }
      `}</style>

      <div className="student-leaderboard-wrap">
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: 32, color: "#4F46E5", display: "flex", alignItems: "center", gap: 10 }}>
            Leaderboard <TrophyFilled style={{ color: "#F59E0B", fontSize: 28 }} />
          </Title>
          <Text style={{ fontSize: 14, color: "#4B5563" }}>
            In this page, you will see your position and overall rankings among other students.
          </Text>
        </div>

        {/* Motivation Banner */}
        <div style={{
          background: "linear-gradient(90deg, #ECFDF5 0%, #D1FAE5 100%)", color: "#065F46",
          padding: "12px 20px", borderRadius: 9999, marginBottom: 28, fontWeight: 600, fontSize: 13,
          display: "flex", alignItems: "center", gap: 8, border: "1px solid #A7F3D0"
        }}>
          🚀 You're doing great, {studentName}! The top is within reach!
        </div>

        {/* Toggle & Filter Row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 8 }}>
          <div style={{ backgroundColor: "#fff", padding: 6, borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <Radio.Group
              className="lb-ranking-toggle"
              optionType="button" buttonStyle="solid"
              value={rankingType}
              onChange={(e) => setRankingType(e.target.value)}
            >
              <Radio.Button value="global">Global Rankings</Radio.Button>
              {hasClass && <Radio.Button value="class">My Class</Radio.Button>}
            </Radio.Group>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", textTransform: "uppercase" }}>
              Filter Course <span style={{ color: "red" }}>*</span>
            </Text>
            <Select
              style={{ width: 240, height: 42 }}
              placeholder="Pilih Course"
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courseList.map((course: any) => ({
                label:
                  course.course_name ??
                  course.name ??
                  course.title ??
                  `Course ${course.id}`,
                value: Number(course.id)
              }))}
            />
          </div>
        </div>

        {/* Podium */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spin size="large" /></div>
        ) : (
          <>
            {rankingList.length > 0 && (
              <div className="podium-container">
                {renderPodiumCard(top2, 2)}
                {renderPodiumCard(top1, 1)}
                {renderPodiumCard(top3, 3)}
              </div>
            )}

            {/* Other Rankings */}
            <div style={{ backgroundColor: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <Title level={4} style={{ margin: 0, fontWeight: 800, color: "#1E1B4B", display: "flex", alignItems: "center", gap: 8 }}>
                  Other Rankings 👥
                </Title>
                <Input
                  placeholder="Search student..."
                  prefix={<SearchOutlined style={{ color: "#9CA3AF" }} />}
                  style={{ width: 220, borderRadius: 10, height: 40 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Table
                className="lb-table"
                columns={columns}
                dataSource={tableData}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 5, showTotal: (total, range) => <span style={{ color: "#9CA3AF", fontSize: 12 }}>Showing {range[0]}-{range[1]} of {total} students</span> }}
                scroll={{ x: "max-content" }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}