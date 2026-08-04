import { useState, useEffect } from "react";
import { LeaderboardApi } from "@/src/actions/leaderboard/leaderboardApi";
import { CourseRecord, ClassRecord } from "@/src/types/leaderboard";

export const useLeaderboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [studentsRank, setStudentsRank] = useState<any[]>([]);

  // Filters
  const [selectedCourse, setSelectedCourse] = useState<string | number | null>(null);
  const [rankingType, setRankingType] = useState<"global" | "class">("global");

  const [currentUserId, setCurrentUserId] = useState<number | string>(3);
  const [currentUserClassId, setCurrentUserClassId] = useState<number | string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const lsUser = localStorage.getItem("user");
      if (lsUser) {
        try {
          const user = JSON.parse(lsUser);
          setCurrentUserId(user.id);
          setCurrentUserClassId(user.class_id);
        } catch (e) {}
      }
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await LeaderboardApi.getCourses();
      setCourses(res);
      if (res && res.length > 0) {
        setSelectedCourse(res[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchRanking();
    }
  }, [selectedCourse, rankingType, currentUserClassId]);

  const fetchRanking = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      let classFilter = null;
      if (rankingType === "class") {
        if (!currentUserClassId) {
          setStudentsRank([]); // if no class, don't show any rank
          setLoading(false);
          return;
        }
        classFilter = currentUserClassId;
      }
      
      const data = await LeaderboardApi.getStudentsRanking(selectedCourse, classFilter);
      setStudentsRank(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    courses,
    studentsRank,
    selectedCourse,
    setSelectedCourse,
    rankingType,
    setRankingType
  };
};
