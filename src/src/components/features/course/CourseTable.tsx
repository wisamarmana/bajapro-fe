"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Input,
  Typography,
  Card,
  Space,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeFilled,
  DeleteFilled,
  EditFilled,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import type { TableColumnsType } from "antd";
import { CourseRecord } from "@/src/types/course";
import { deleteCourseApi } from "@/src/actions/course/courseApi";
import { useAuth } from "@/src/hooks/useAuth";
const { Title } = Typography;

export default function ListCourse({
  initialData,
}: {
  initialData: CourseRecord[];
}) {
  const router = useRouter();
  const { can, loading: authLoading, user } = useAuth(); // Hook Keamanan
  const [searchText, setSearchText] = useState("");
  const [courses, setCourses] = useState<CourseRecord[]>(initialData);
  const [loading] = useState(false);

  const filteredCourses = courses.filter((item) =>
    item.course_name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.description.toLowerCase().includes(searchText.toLowerCase())
  );

  // ... (tetap sama)

  if (!authLoading && !can("course.read")) {
    return (
      <div style={{ padding: 24, textAlign: "center", marginTop: 50 }}>
        <Typography.Title level={3} style={{ color: "#ff4d4f" }}>
          Akses Ditolak
        </Typography.Title>
        <Typography.Text>
          Anda tidak memiliki izin untuk melihat halaman Course.
        </Typography.Text>
      </div>
    );
  }

  const columns: TableColumnsType<CourseRecord> = [
    {
      title: "No.",
      key: "no",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Course",
      dataIndex: "course_name",
      key: "course_name",
      sorter: (a, b) => a.course_name.localeCompare(b.course_name),
    },
    {
      title: "Deskripsi",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      render: (text) => text && text.length > 80 ? text.substring(0, 80) + "..." : text,
    },
  ];

  // HANYA TAMPILKAN KOLOM ACTION JIKA PUNYA IZIN UPDATE/DELETE/READ
  if (can('course.update') || can('course.delete') || can('course.read')) {
    columns.push({
      title: "Action",
      key: "action",
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeFilled />}
            style={{ backgroundColor: "#1677ff" }}
            onClick={() => router.push(`/course/${record.id}?view=true`)}
          >
            {!can('course.update') && "Detail"}
          </Button>

          {can('course.update') && (
            <Button
              type="primary"
              icon={<EditFilled />}
              style={{ backgroundColor: "#faad14", color: "black" }}
              onClick={() => router.push(`/course/${record.id}`)}
            />
          )}

          {can('course.delete') && (
            <Popconfirm
              title="Hapus Course"
              onConfirm={() => {
                deleteCourseApi(record.id).then(() => {
                  setCourses((prev) => prev.filter((item) => item.id !== record.id));
                });
              }}
            >
              <Button type="primary" danger icon={<DeleteFilled />} />
            </Popconfirm>
          )}
        </Space>
      ),
    });
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      <Card
        style={{
          borderRadius: 16,
          border: "none",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <Title level={2} style={{ marginBottom: 8, fontSize: "clamp(20px, 4vw, 24px)" }}>
          List Course
        </Title>
        <p style={{ color: "gray", marginBottom: "24px" }}>
          Kelola course, lesson, dan materi
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: can('course.create') ? "space-between" : "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: 24,
          }}
        >
          {/* TOMBOL TAMBAH HANYA UNTUK YANG PUNYA IZIN CREATE */}
          {can('course.create') && (
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              style={{ backgroundColor: "#7246BA" }}
              onClick={() => router.push("/course/add")}
            >
              Tambah Course
            </Button>
          )}

          <Input
            placeholder="Cari"
            prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
            size="large"
            style={{ width: 300, borderRadius: 8 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredCourses}
          loading={loading}
          rowKey="id"
          pagination={{
            total: filteredCourses.length,
            pageSize: 5,
            showTotal: (total) => `Total ${total} items`,
          }}
          style={{
            border: "1px solid #f0f0f0",
            borderRadius: 8,
            overflow: "hidden",
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>
    </div>
  );
}
