"use client";

import { useState, useEffect } from "react";
import { Form, Button, Card, Space, message, Segmented, App } from "antd"; 
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { fetchLessonsByCourseApi, createLessonApi } from "@/src/actions/course/courseApi";
import { LessonRecord, LessonCreateData } from "@/src/types/course";
import { useManageCourseMateri } from "@/src/hooks/course/useCourse";
import { LessonListTab } from "./LessonListTab";
import { SubLessonListTab } from "./SubLessonListTab";
import { CourseDetailTab } from "./CourseDetailTab";

export const ManageCourseMateri = () => {
  const router = useRouter();
  const params = useParams();
  const { message: messageApi } = App.useApp(); 
  const courseId = params?.id ? Number(params.id) : null;

  const {
    courseData,
    handleSaveCourse,
    loading,
    activeTab,
    setActiveTab,
    isMounted,
    lessons,
    levels,
    handleAddLesson,
    handleUpdateLesson,
    handleDeleteLesson,
    handleReorderLessons,
    subLessons,
    selectedLessonId,
    setSelectedLessonId,
    handleSaveSubLessonAll,
    handleDeleteSubLesson,
    handleReorderSubLessons,
  } = useManageCourseMateri(courseId);

  const isEditMode = !!params?.id;

  if (!isMounted) {
    return null; 
  }

  // 2. Definisi Items untuk Tabs AntD
  const tabItems = [
    {
      key: "detail",
      label: "Detail Course",
      forceRender: true,
      children: (
        <Card
          className="mt-4"
          style={{
            borderRadius: "16px",
            border: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <CourseDetailTab
            key="course-detail-tab"
            initialData={courseData}
            onSave={handleSaveCourse}
            loading={loading}
          />
        </Card>
      ),
    },
    {
      key: "lessons",
      label: "Lessons",
      forceRender: true,
      children: (
        <LessonListTab
          courseId={courseId!}
          courseName={courseData?.course_name || "Course Tanpa Nama"}
          levels={levels} 
          lessons={lessons}
          loading={loading}
          onAdd={handleAddLesson}
          onUpdate={handleUpdateLesson}
          onDelete={handleDeleteLesson}
        />
      ),
    },
    {
      key: "materials",
      label: "Sub Lessons & Materials",
      forceRender: true,
      children: (
        <SubLessonListTab
          lessons={lessons}
          subLessons={subLessons}
          selectedLessonId={selectedLessonId}
          onSelectLesson={setSelectedLessonId}
          onSaveAll={handleSaveSubLessonAll}
          onDeleteSub={handleDeleteSubLesson}
          onReorderSub={handleReorderSubLessons}
          loading={loading}
          courseId={courseId}
        />
      ),
    },
  ];

  const handleTabChange = (key: string) => {
    if (!isEditMode && key !== "detail") {
      messageApi.warning("Simpan Detail Course terlebih dahulu!");
      return;
    }
    setActiveTab(key);
  };

  return (
    <div
      style={{
        padding: "16px",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <Button
          size="middle"
          color="default"
          variant="filled"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/course")}
        >
          Kembali ke Daftar Course
        </Button>
      </div>

      <div style={{ backgroundColor: "white", padding: "8px 12px", borderRadius: "12px", marginBottom: "16px", overflowX: 'auto' }}>
        <Segmented
          options={[
            { label: 'Detail Course', value: 'detail' },
            { label: 'Lessons', value: 'lessons' },
            { label: 'Sub Lessons & Materials', value: 'materials' },
          ]}
          value={activeTab}
          onChange={handleTabChange}
          style={{ padding: '4px' }}
        />
      </div>

      <div>
        {activeTab === "detail" && tabItems[0].children}
        {activeTab === "lessons" && tabItems[1].children}
        {activeTab === "materials" && tabItems[2].children}
      </div>
    </div>
  );
};
