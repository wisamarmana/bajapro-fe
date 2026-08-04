import { useEffect, useState } from "react";
import { LeaderboardApi } from "@/src/actions/leaderboard/leaderboardApi";
import {
  CourseRecord,
  ClassRecord,
} from "@/src/types/leaderboard";
import { useAuth } from "@/src/hooks/useAuth";

type UserRole = "admin" | "teacher" | "student";

const normalizeArray = <T,>(response: any): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const useLeaderboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [studentsRank, setStudentsRank] = useState<any[]>([]);

  const [selectedCourse, setSelectedCourse] =
    useState<string | number | null>(null);

  const [rankingType, setRankingType] =
    useState<"global" | "class">("global");

  const [selectedClass, setSelectedClass] =
    useState<string | number | null>(null);

  const [currentUserRole, setCurrentUserRole] =
    useState<UserRole>("student");

  const [currentUserId, setCurrentUserId] =
    useState<number | string | null>(null);

  useEffect(() => {
    if (!user) return;

    const activeRoleNames = Array.isArray(user.has_roles)
      ? user.has_roles
        .filter((role: any) => role?.isactive !== false)
        .map((role: any) =>
          String(role?.name ?? "").toLowerCase()
        )
      : [];

    if (activeRoleNames.includes("admin")) {
      setCurrentUserRole("admin");
    } else if (
      activeRoleNames.includes("teacher") ||
      activeRoleNames.includes("pengajar")
    ) {
      setCurrentUserRole("teacher");
    } else {
      setCurrentUserRole("student");
    }

    setCurrentUserId(user.id);

    const userClassId =
      user.class_id ??
      user.class?.id ??
      null;

    if (userClassId) {
      setSelectedClass(Number(userClassId));
    }
  }, [user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response =
          await LeaderboardApi.getCourses();

        const courseData =
          normalizeArray<CourseRecord>(response);

        setCourses(courseData);

        if (courseData.length > 0) {
          setSelectedCourse((current) =>
            current ?? courseData[0].id
          );
        } else {
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil course leaderboard:",
          error
        );

        setCourses([]);
        setSelectedCourse(null);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        let response: any;

        if (currentUserRole === "admin") {
          response =
            await LeaderboardApi.getClasses();
        } else if (
          currentUserRole === "teacher" &&
          currentUserId
        ) {
          response =
            await LeaderboardApi.getClassesByTeacher(
              currentUserId
            );
        } else {
          setClasses([]);
          return;
        }

        setClasses(
          normalizeArray<ClassRecord>(response)
        );
      } catch (error) {
        console.error(
          "Gagal mengambil class leaderboard:",
          error
        );

        setClasses([]);
      }
    };

    if (
      currentUserRole === "admin" ||
      currentUserRole === "teacher"
    ) {
      fetchClasses();
    }
  }, [currentUserRole, currentUserId]);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!selectedCourse) {
        setStudentsRank([]);
        return;
      }

      if (
        rankingType === "class" &&
        !selectedClass
      ) {
        setStudentsRank([]);
        return;
      }

      setLoading(true);

      try {
        const classFilter =
          rankingType === "class"
            ? selectedClass
            : null;

        const response =
          await LeaderboardApi.getStudentsRanking(
            selectedCourse,
            classFilter
          );

        setStudentsRank(
          normalizeArray<any>(response)
        );
      } catch (error) {
        console.error(
          "Gagal mengambil ranking:",
          error
        );

        setStudentsRank([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [
    selectedCourse,
    rankingType,
    selectedClass,
  ]);

  return {
    loading,
    courses,
    classes,
    studentsRank,

    selectedCourse,
    setSelectedCourse,

    rankingType,
    setRankingType,

    selectedClass,
    setSelectedClass,

    currentUserRole,
  };
};