"use client";

import React from "react";
import { Typography, Select, Radio } from "antd";
import { useLeaderboard } from "@/src/hooks/leaderboard/useLeaderboard";
import { Top3Cards } from "@/src/components/features/leaderboard/Top3Cards";
import { LeaderboardTable } from "@/src/components/features/leaderboard/LeaderboardTable";

const { Title, Text } = Typography;

export default function LeaderboardManager() {
  const {
    courses,
    classes,
    studentsRank,
    loading,
    selectedCourse,
    setSelectedCourse,
    rankingType,
    setRankingType,
    selectedClass,
    setSelectedClass
  } = useLeaderboard();

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 w-full">
        {/* Kiri: Judul */}
        <div className="flex flex-col">
          <Title level={3} style={{ margin: 0, fontWeight: "bold" }}>Leaderboard</Title>
          <Text type="secondary" style={{ fontSize: 14 }}>View and manage student rankings</Text>
        </div>

        {/* Tengah: Toggle */}
        <div className="flex w-full lg:w-auto justify-start lg:justify-center">
          <div style={{ backgroundColor: "#e6e6e6", padding: 4, borderRadius: 8, display: "inline-block" }}>
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              value={rankingType}
              onChange={(e) => {
                setRankingType(e.target.value);
                setSelectedClass(null); // reset class selection on toggle
              }}
              style={{
                borderRadius: 8,
              }}
            >
              <Radio.Button value="global" style={{ borderRadius: "8px 0 0 8px", border: "none", boxShadow: "none" }}>Global Rankings</Radio.Button>
              <Radio.Button value="class" style={{ borderRadius: "0 8px 8px 0", border: "none", boxShadow: "none" }}>Class Rankings</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Kanan: Filter Course & Class */}
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto justify-start lg:justify-end items-start sm:items-end">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <Text strong>Filter Course <span style={{ color: "red" }}>*</span></Text>
            <Select
              style={{ width: "100%", minWidth: 200 }}
              placeholder="Pilih Course"
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courses.map(c => ({ label: c.course_name, value: c.id }))}
            />
          </div>

          {rankingType === "class" && (
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <Text strong>Filter Class <span style={{ color: "red" }}>*</span></Text>
              <Select
                style={{ width: "100%", minWidth: 200 }}
                placeholder="Pilih Kelas"
                value={selectedClass}
                onChange={setSelectedClass}
                options={classes.map(c => ({ label: c.class_name, value: c.id }))}
              />
            </div>
          )}
        </div>
      </div>

      {rankingType === "class" && !selectedClass ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Text type="secondary" style={{ fontSize: 18 }}>Silakan pilih kelas terlebih dahulu untuk melihat ranking.</Text>
        </div>
      ) : (
        <>
          {studentsRank.length > 0 && (
            <Top3Cards data={studentsRank} />
          )}

          <LeaderboardTable data={studentsRank} loading={loading} />
        </>
      )}
    </div>
  );
}

