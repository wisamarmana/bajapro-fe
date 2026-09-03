"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Empty,
  Space,
  Tag,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  MenuOutlined,
  EditOutlined,
  EditFilled,
  DeleteFilled,
} from "@ant-design/icons";
// 1. IMPORT LIBRARY BARU
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { LessonRecord, LessonCreateData } from "@/src/types/course";
import { LevelData } from "@/src/types/level";
import { useAuth } from "@/src/hooks/useAuth";

const { Text, Title } = Typography;

// --- PROPS DARI INDUK ---
interface Props {
  courseId: number;
  courseName: string;
  levels: LevelData[];
  lessons: LessonRecord[];
  loading: boolean;
  onAdd: (values: LessonCreateData) => void;
  onUpdate: (id: number, values: Partial<LessonRecord>) => void;
  onDelete: (id: number) => void;
}

export const LessonListTab: React.FC<Props> = ({
  courseId,
  courseName,
  levels,
  lessons,
  loading,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const { can, user } = useAuth();
  const canCreate = can('course.create');
  const canUpdate = can('course.update');
  const canDelete = can('course.delete');

  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [localLessons, setLocalLessons] = useState<LessonRecord[]>([]);

  useEffect(() => {
    // Tunda update state ke microtask berikutnya agar tidak terjadi cascading render
    const timeoutId = setTimeout(() => {
      setLocalLessons(lessons);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [lessons]);

  // --- FUNGSI MODAL ---
  const showModal = (record?: LessonRecord) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    form.validateFields().then((values) => {
      const levelIdNumber = Number(values.level_id);
      if (editingId) {
        onUpdate(editingId, {
          ...values,
          level_id: levelIdNumber,
        });
      } else {
        const lessonsInLevel = localLessons.filter(
          (l) => Number(l.level_id) === levelIdNumber,
        );
        const nextPosition = lessonsInLevel.length + 1;

        onAdd({
          ...values,
          course_id: courseId,
          level_id: levelIdNumber,
          position: nextPosition,
          img_thumbnail: null,
          published: 1,
          isactive: true,
        });
      }
      setIsModalOpen(false);
    });
  };

  // --- FUNGSI DRAG AND DROP (DND LIBRARY) ---
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const updatedLessons = Array.from(localLessons);
    const draggedLessonIndex = updatedLessons.findIndex(
      (l) => String(l.id) === draggableId,
    );

    if (draggedLessonIndex === -1) return;
    const draggedLesson = updatedLessons[draggedLessonIndex];

    // SKENARIO A: PINDAH POSISI DI LEVEL YANG SAMA
    if (source.droppableId === destination.droppableId) {
      const levelLessons = updatedLessons
        .filter((l) => String(l.level_id) === source.droppableId)
        .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

      levelLessons.splice(source.index, 1);
      levelLessons.splice(destination.index, 0, draggedLesson);

      levelLessons.forEach((lesson, index) => {
        const newPosition = index + 1;

        if (lesson.position !== newPosition) {
          lesson.position = newPosition; // Update lokal
          onUpdate(lesson.id, { position: newPosition }); // Update API
        }
      });
    } else {
      draggedLesson.level_id = Number(destination.droppableId);

      const targetLevelLessons = updatedLessons
        .filter(
          (l) =>
            String(l.level_id) === destination.droppableId &&
            String(l.id) !== draggableId,
        )
        .sort((a, b) => Number(a.position || 0) - Number(b.position || 0));

      targetLevelLessons.splice(destination.index, 0, draggedLesson);

      targetLevelLessons.forEach((lesson, index) => {
        const newPosition = index + 1;
        lesson.position = newPosition; // Update lokal
        onUpdate(lesson.id, {
          level_id: Number(destination.droppableId),
          position: newPosition,
        });
      });
    }

    setLocalLessons(updatedLessons);
  };

  return (
    <div>
      <Card
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <div style={{ marginTop: "8px", marginBottom: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Course
              </Text>
              <Title level={4} style={{ margin: 0, color: "orange" }}>
                {courseName || "Memuat Course..."}
              </Title>
            </div>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ borderRadius: "6px" }}
              >
                Tambah Lesson
              </Button>
            )}
          </div>
        }
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {!levels || levels.length === 0 ? (
          <Empty description="Data Level tidak ditemukan. Pastikan API Level berjalan." />
        ) : (
          <>
            {user?.role === 'admin' && (
              <Alert 
                message="Atur urutan lesson dengan menyeret (drag) baris ke posisi yang diinginkan." 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }} 
              />
            )}
            {/* ARENA DRAG & DROP UTAMA */}
            <DragDropContext onDragEnd={canUpdate ? handleDragEnd : () => {}}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {levels.map((level) => {
                // Saring menggunakan localLessons
                const levelLessons = localLessons
                  .filter((l) => Number(l.level_id) === Number(level.id))
                  .sort(
                    (a, b) => Number(a.position || 0) - Number(b.position || 0),
                  );

                return (
                  <Droppable key={level.id} droppableId={String(level.id)} isDropDisabled={!canUpdate}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          backgroundColor: snapshot.isDraggingOver ? "#f0f7ff" : "#fcfcfc",
                          border: snapshot.isDraggingOver ? "1px dashed #1677ff" : "1px solid #d9d9d9",
                          borderRadius: "8px",
                          padding: "16px",
                          minHeight: "130px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <Title level={5} style={{ marginTop: 0, marginBottom: 16 }}>
                          <Tag color="cyan" style={{ fontSize: 12, padding: "4px 12px" }}>
                            Level: {level.level_name}
                          </Tag>
                        </Title>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {levelLessons.map((lesson, index) => (
                            canUpdate ? (
                              <Draggable key={lesson.id} draggableId={String(lesson.id)} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      padding: "12px 16px",
                                      backgroundColor: snapshot.isDragging ? "#fafafa" : "#ffffff",
                                      border: "1px solid #f0f0f0",
                                      borderRadius: "6px",
                                      boxShadow: snapshot.isDragging ? "0 8px 16px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.02)",
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div
                                      {...provided.dragHandleProps}
                                      style={{ cursor: "grab", marginRight: "16px", display: "flex", alignItems: "center" }}
                                    >
                                      <MenuOutlined style={{ color: "#bfbfbf" }} />
                                    </div>
                                    <div style={{ flex: 1 }}><Text strong>{lesson.title}</Text></div>
                                    <Space>
                                      <Button
                                        type="primary"
                                        icon={<EditFilled />}
                                        style={{ backgroundColor: "#faad14", color: "black" }}
                                        onClick={() => showModal(lesson)}
                                      />
                                      {canDelete && (
                                        <Button type="primary" danger icon={<DeleteFilled />} onClick={() => onDelete(lesson.id)} />
                                      )}
                                    </Space>
                                  </div>
                                )}
                              </Draggable>
                            ) : (
                              /* VIEW ONLY ITEM (Tanpa Draggable) */
                              <div
                                key={lesson.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  padding: "12px 16px",
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #f0f0f0",
                                  borderRadius: "6px",
                                }}
                              >
                                <div style={{ flex: 1 }}><Text strong>{lesson.title}</Text></div>
                                <Button type="primary" size="small" onClick={() => showModal(lesson)}>Detail</Button>
                              </div>
                            )
                          ))}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
          </>
        )}
      </Card>

      {/* --- MODAL FORM --- */}
      <Modal
        forceRender
        title={editingId ? (canUpdate ? "Edit Lesson" : "Detail Lesson") : "Tambah Lesson Baru"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
        okText="Simpan Data"
        cancelText="Tutup"
        centered
        confirmLoading={loading}
        footer={!canUpdate ? [
          <Button key="back" onClick={() => setIsModalOpen(false)}>Tutup</Button>
        ] : undefined}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <fieldset disabled={!canUpdate} style={{ border: "none", padding: 0, margin: 0 }}>
            <Form.Item
              name="level_id"
              label="Pilih Level"
              rules={[{ required: true, message: "Level wajib dipilih!" }]}
            >
              <Select
                placeholder="-- Pilih Level --"
                size="large"
                options={levels.map((level) => ({
                  label: level.level_name,
                  value: Number(level.id),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="title"
              label="Nama Lesson"
              rules={[{ required: true, message: "Nama lesson wajib diisi!" }]}
            >
              <Input placeholder="Contoh: Pengenalan Tipe Data" size="large" />
            </Form.Item>

            <Form.Item name="description" label="Deskripsi Singkat">
              <Input.TextArea
                rows={3}
                placeholder="Jelaskan secara singkat materi ini..."
              />
            </Form.Item>
          </fieldset>
        </Form>
      </Modal>
    </div>
  );
};
