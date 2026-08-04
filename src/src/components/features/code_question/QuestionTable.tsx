"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Space, Select, Popconfirm, Card, Input, Popover, App } from "antd";
import { useRouter } from "next/navigation";
import { useQuestion } from "@/src/hooks/code_question/useQuestion";
import { QuestionRecord } from "@/src/types/code_question";
import Title from "antd/es/typography/Title";
import { SearchOutlined, FilterOutlined, EyeFilled, EditFilled, DeleteFilled } from "@ant-design/icons";
import * as api from "@/src/actions/code_question/questionApi";

// ✅ Tipe untuk option dropdown
type SelectOption = { label: string; value: string | number };

import { useAuth } from "@/src/hooks/useAuth";
const QuestionTable = () => {
  const router = useRouter();
  const { can } = useAuth();
  
  const { 
    fetching, questions, fetchQuestions, handleDeleteQuestion,
    courses, loadCourses,
  } = useQuestion();

  const [searchText, setSearchText] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // ✅ FIX 2: Filter berdiri sendiri — course & sublesson independent
  const [tempCourseId, setTempCourseId] = useState<string | number | undefined>();
  const [tempSubLessonId, setTempSubLessonId] = useState<string | number | undefined>();
  const [allSubLessons, setAllSubLessons] = useState<SelectOption[]>([]);

  const [activeCourseId, setActiveCourseId] = useState<number | undefined>();
  const [activeSubLessonId, setActiveSubLessonId] = useState<string | number | undefined>();

  // Load semua sublesson sekali untuk filter (tidak perlu bergantung ke course)
  useEffect(() => {
    api.fetchSubLessonsByLessonApi("").catch(() => null); // warm up
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sublessons`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { id: string | number; title: string }[]) => {
        setAllSubLessons(data.map((sl) => ({ label: sl.title, value: sl.id })));
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    fetchQuestions(activeCourseId, activeSubLessonId as number | undefined);
  }, [activeCourseId, activeSubLessonId, fetchQuestions]);

  const filteredQuestions = useMemo(() => {
    if (!searchText) return questions;
    
    const lowerSearch = searchText.toLowerCase();
    
    return questions.filter((q) => {
    
      const matchQuestion = q.code_question?.toLowerCase().includes(lowerSearch);

      const matchCourse = q.course_name?.toLowerCase().includes(lowerSearch);

      const matchSubLesson = q.sub_lesson_name?.toLowerCase().includes(lowerSearch);
      
      // Jika salah satu cocok, maka tampilkan!
      return matchQuestion || matchCourse || matchSubLesson;
    });
  }, [questions, searchText]);

  const handleApplyFilter = () => {
    setActiveCourseId(tempCourseId as number | undefined);
    setActiveSubLessonId(tempSubLessonId);
    setFilterOpen(false);
  };

  const handleResetFilter = () => {
    setTempCourseId(undefined);
    setTempSubLessonId(undefined);
    setActiveCourseId(undefined);
    setActiveSubLessonId(undefined);
    setFilterOpen(false);
  };

  const filterContent = (
    <div style={{ width: 250 }}>
      {/* ✅ FIX 2: Course dan SubLesson berdiri sendiri, tidak saling bergantung */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Course</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Semua Course"
          value={tempCourseId}
          onChange={setTempCourseId}
          options={courses}
          allowClear
        />
      </div>

      {/* <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Sub Lesson</label>
        <Select
          style={{ width: "100%" }}
          placeholder="Semua Sub Lesson"
          value={tempSubLessonId}
          onChange={setTempSubLessonId}
          options={allSubLessons}
          allowClear
          showSearch
          filterOption={(input, option) =>
            String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
        />
      </div> */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={handleResetFilter}>Reset</Button>
        <Button type="primary" onClick={handleApplyFilter}>Terapkan</Button>
      </div>
    </div>
  );

  const columns = [
    { 
      title: "No", 
      key: "no",
      width: 60,
      align: "center" as const,
      // 🌟 Ganti 'any' menjadi 'unknown' dan 'QuestionRecord'
      render: (_text: unknown, _record: QuestionRecord, index: number) => index + 1 
    },
    { 
      title: "Course", 
      key: "course_name",
      width: 180,
      sorter: (a: QuestionRecord, b: QuestionRecord) => {
        const nameA = a.course_name ?? "";
        const nameB = b.course_name ?? "";
        return nameA.localeCompare(nameB);
      },
      // ✅ FIX 1 & 4: Tampilkan course_name yang sudah di-enrich dari API
      render: (_text: unknown, record: QuestionRecord) => {
        if (record.course_name && record.course_name !== "-") return record.course_name;
        // fallback ke dropdown courses
        const found = courses.find((c) => String(c.value) === String(record.course_id));
        return found?.label ?? "-";
      },
    },
    {
      title: "Sub Lesson",
      key: "sub_lesson_name",
      width: 180,
      sorter: (a: QuestionRecord, b: QuestionRecord) => {
        const nameA = a.sub_lesson_name ?? "";
        const nameB = b.sub_lesson_name ?? "";
        return nameA.localeCompare(nameB);
      },
      // ✅ FIX 1 & 4: Tampilkan sub_lesson_name yang sudah di-enrich dari API
      render: (_text: unknown, record: QuestionRecord) => {
        if (record.sub_lesson_name && record.sub_lesson_name !== "-") return record.sub_lesson_name;
        // fallback ke allSubLessons
        const found = allSubLessons.find((s) => String(s.value) === String(record.sub_lesson_id));
        return found?.label ?? "-";
      },
    },
    {
      title: "Soal",
      key: "code_question",
      render: (_: any, record: any) => {
        const text = record.code_question || "";
        return (
          <div dangerouslySetInnerHTML={{ __html: text.substring(0, 100) + (text.length > 100 ? "..." : "") }} />
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      width: 130,
      fixed: "right" as const, 
      render: (_: unknown, record: QuestionRecord) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EyeFilled />}  
            style={{ backgroundColor: "#1677ff" }}  
            onClick={() => router.push(`/code_question/${record.id}?view=true`)}
          >
            {!can("question.update") && "Detail"}
          </Button>

          {can("question.update") && (
            <Button 
              type="primary" 
              icon={<EditFilled />} 
              style={{ backgroundColor: "#faad14", color: "black" }}  
              onClick={() => router.push(`/code_question/${record.id}`)}
            />
          )}

          {can("question.delete") && (
            <Popconfirm
              title="Yakin hapus keseluruhan soal ini?"
              onConfirm={() => handleDeleteQuestion(record.id)}
            >
              <Button type="primary" danger icon={<DeleteFilled />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "clamp(12px, 3vw, 24px)", minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Card style={{ borderRadius: 16, border: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <Title level={2} style={{ marginBottom: 8, fontSize: "clamp(20px, 4vw, 24px)" }}>
          List Question
        </Title>
        <p style={{ color: "gray", marginBottom: "24px" }}>
          Kelola pertanyaan coding dan essay untuk materi yang tersedia.
        </p>

        <div style={{ background: "#fff", borderRadius: 8 }}>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "16px", 
            justifyContent: can("question.create") ? "space-between" : "flex-start", 
            alignItems: "center", 
            marginBottom: 16 
          }}>
            
            {can("question.create") && (
              <Button
                type="primary"
                size="large"
                onClick={() => router.push("/code_question/add")}
              >
                + Tambah Pertanyaan
              </Button>
            )}

            <Space wrap>
              {/* PERBAIKAN 3: Search Bar */}
              <Input
                placeholder="Cari Soal"
                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                size="large"
              />
              {/* PERBAIKAN 2: Popover Filter */}
              <Popover
                content={filterContent}
                title="Filter Data"
                trigger="click"
                open={filterOpen}
                onOpenChange={setFilterOpen}
                placement="bottomRight"
              >
                <Button size="large" icon={<FilterOutlined />}>Filter</Button>
              </Popover>
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={filteredQuestions} // Pakai data yang sudah di-filter (Search)
            rowKey="id"
            loading={fetching}
            scroll={{ x: 900 }}
          />
        </div>
      </Card>
    </div>
  );
};

// ✅ FIX 5: Wrap dengan App agar message.success/error bisa pakai dynamic theme
const QuestionTableWithApp = () => (
  <App>
    <QuestionTable />
  </App>
);

export default QuestionTableWithApp;
