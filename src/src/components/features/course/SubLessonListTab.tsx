"use client";

import React, { useState, useEffect } from "react";
import { Card, Select, Button, Typography, Empty, Space, Spin, App, Alert } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, MenuOutlined, EditFilled, DeleteFilled } from "@ant-design/icons";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { SubLessonForm } from "./SubLessonForm";
import { LessonRecord, SubLessonRecord, ReorderItem, MaterialRecord, SubLessonCreateData, MaterialsCreateData } from "@/src/types/course";
import { useAuth } from "@/src/hooks/useAuth";

const { Text } = Typography;

interface Props {
  lessons: LessonRecord[];
  subLessons: SubLessonRecord[];
  selectedLessonId: number | null;
  onSelectLesson: (id: number) => void;
  onSaveAll: (subLesson: SubLessonCreateData, materials: MaterialRecord[], editId?: number) => Promise<boolean>;
  // ... (tetap sama)
  onDeleteSub: (id: number) => void;
  onReorderSub: (updates: ReorderItem[]) => void;
  loading: boolean;
  courseId?: number | null;
}

export const SubLessonListTab: React.FC<Props> = ({
  lessons, subLessons, selectedLessonId, onSelectLesson, onSaveAll, onDeleteSub, onReorderSub, loading, courseId
}) => {
  const { message } = App.useApp();
  const { can, user } = useAuth();
  const canCreate = can('course.create');
  const canUpdate = can('course.update');
  const canDelete = can('course.delete');
  const [view, setView] = useState<"list" | "form">("list");
  const [editingData, setEditingData] = useState<SubLessonRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Persist view state in sessionStorage so refresh stays on materials form
  const storageKey = `sublesson_view_${courseId || "default"}`;

  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.view === "form") {
          setView("form");
          // Try to restore editing data from subLessons
          if (parsed.editingId) {
            const found = subLessons.find(s => s.id === parsed.editingId);
            if (found) setEditingData(found);
          }
        }
      } catch { /* ignore parse errors */ }
    }
  }, [subLessons]);

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify({
      view,
      editingId: editingData?.id || null,
    }));
  }, [view, editingData, storageKey]);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(subLessons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      newPosition: index + 1
    }));
    onReorderSub(updates);
  };

  if (view === "form") {
    return (
      <Spin spinning={isSaving}>
       <SubLessonForm
        lessons={lessons}
        initialLessonId={selectedLessonId}
        initialData={editingData}
        onBack={() => { setEditingData(null); setView("list"); }}
        onSave={async (vals, mats) => { 
          setIsSaving(true);
          try {
            // Await save completion before switching back to list
            await onSaveAll(vals, mats, editingData?.id); 
            // Wait a bit to let the user see the success message
            await new Promise((resolve) => setTimeout(resolve, 800));
            setEditingData(null);
            setView("list"); 
          } catch (err) {
            message.error("Gagal menyimpan data. Silakan coba lagi.");
          } finally {
            setIsSaving(false);
          }
        }}
        loading={loading || isSaving}
      />
      </Spin>
    );
  }

  return (
    <div className="">
      <Card>
        <Space orientation="vertical" className="w-full">
          {user?.role === 'admin' && !selectedLessonId && (
            <Alert 
              message="Pilih Lesson yang ingin dikelola untuk membuat Sub Lesson dan Materi." 
              type="info" 
              showIcon 
              style={{ marginBottom: 12 }} 
            />
          )}
          <Text strong>Pilih Lesson:</Text>
          <Select
            className="w-full"
            placeholder="Pilih Lesson"
            options={[...lessons].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)).map(l => ({ label: l.title, value: l.id }))}
            value={selectedLessonId}
            onChange={(val) => onSelectLesson(val)}
          />
          {canCreate && (
            <Button 
              style={{marginTop: 4}}
              type="primary" 
              size="medium"
              icon={<PlusOutlined />} 
              disabled={!selectedLessonId}
              onClick={() => { setEditingData(null); setView("form"); }}
            >
              Tambah Sub Lesson
            </Button>
          )}
        </Space>
      </Card>
      <div style={{marginTop: 16}}>
      <Card title="Urutan Materi Sub Lesson">
        {!selectedLessonId ? (
          <Empty description="Pilih Lesson terlebih dahulu" />
        ) : (
          <>
            {user?.role === 'admin' && (
              <Alert 
                message="Atur urutan sub lesson dengan menyeret (drag) baris ke posisi yang diinginkan." 
                type="info" 
                showIcon 
                style={{ marginBottom: 16 }} 
              />
            )}
            <DragDropContext onDragEnd={canUpdate ? handleOnDragEnd : () => {}}>
              <Droppable droppableId="sublesson-list" isDropDisabled={!canUpdate}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {subLessons.map((sub, index) => (
                    canUpdate ? (
                      <Draggable key={sub.id} draggableId={String(sub.id)} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex items-center justify-between p-4 bg-white border-1 border-black-300 rounded-lg shadow-sm"
                          >
                            <Space>
                              <div {...provided.dragHandleProps} className="cursor-grab text-gray-400">
                                <MenuOutlined />
                              </div>
                              <Text strong>{sub.title}</Text>
                            </Space>
                              <Space>
                                <Button
                                  type="primary"
                                  icon={<EditFilled />}
                                  style={{ backgroundColor: "#faad14", color: "black" }}
                                  onClick={() => { setEditingData(sub); setView("form"); }}
                                />
                                {canDelete && (
                                  <Button type="primary" danger icon={<DeleteFilled />} onClick={() => onDeleteSub(sub.id)} />
                                )}
                              </Space>
                          </div>
                        )}
                      </Draggable>
                    ) : (
                      /* VIEW ONLY SUB LESSON */
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-white border-1 border-black-300 rounded-lg shadow-sm"
                      >
                        <Text strong>{sub.title}</Text>
                        <Button 
                          type="primary" 
                          size="small" 
                          onClick={() => { setEditingData(sub); setView("form"); }}
                        >
                          Detail
                        </Button>
                      </div>
                    )
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          </>
        )}
      </Card>
      </div>
    </div>
  );
};
