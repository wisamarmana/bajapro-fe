"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Button, Tag, Spin, message, Tabs, Modal, Input, Avatar } from "antd";
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getStudentSubLessonReportDetailApi } from "@/src/actions/student/studentApi";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function ReportCourseidSublessonidManager() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params?.courseId);
  const subLessonId = Number(params?.subLessonId);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  // Edit Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<any>(null);
  const [newAnswerText, setNewAnswerText] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  
  const [activeTab, setActiveTab] = useState("1");

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && courseId && subLessonId) {
      fetchDetailData(user.id, courseId, subLessonId);
    }
  }, [courseId, subLessonId, user?.id]);

  const fetchDetailData = async (studentId: number, cId: number, sId: number) => {
    try {
      setLoading(true);
      const res = await getStudentSubLessonReportDetailApi(cId, sId);
      setData(res);
    } catch (e) {
      console.error(e);
      messageApi.error("Gagal memuat detail report.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingAnswer(record);
    setNewAnswerText(record.answer?.answer || "");
    setIsModalVisible(true);
  };

  const handleUpdateAnswer = async () => {
    if (!editingAnswer || !editingAnswer.answer) return;
    
    try {
      setSubmitLoading(true);

      const index = data.essayDetails.findIndex((d: any) => d.question.id === editingAnswer.question.id);
      let kp = editingAnswer.answer.konteks_penjelasan || 0;
      let kr = editingAnswer.answer.keruntutan || 0;
      let kb = editingAnswer.answer.kebenaran || 0;

      let aiScore = 0;
      try {
        const formData = new URLSearchParams();
        formData.append('esay_question', editingAnswer.question.essay_question || '');
        formData.append('esay_answer', editingAnswer.question.answer || '');
        formData.append('esay_answer2', editingAnswer.question.answer_2 || '');
        formData.append('esay_answer3', editingAnswer.question.answer_3 || '');
        formData.append('esay_answer4', editingAnswer.question.answer_4 || '');
        formData.append('user_answer', newAnswerText);

        const aiRes = await fetch('http://labai.polinema.ac.id:90/online-compiler/compiler/generate/grade', {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (aiRes.ok) {
          const json = await aiRes.json();
          if (json && typeof json.output === 'number') {
            aiScore = json.output;
          }
        }
      } catch (e) {
        console.error('Failed to generate AI score', e);
      }

      if (index === 0) kp = aiScore;
      else if (index === 1) kr = aiScore;
      else if (index === 2) kb = aiScore;
      else kp = aiScore;

      const response = await fetch(`${BASE_URL}/t_essay_answer/${editingAnswer.answer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            answer: newAnswerText,
            konteks_penjelasan: kp,
            keruntutan: kr,
            kebenaran: kb,
            is_approved_by_teacher: null,
            updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        messageApi.success("Jawaban berhasil diubah dan dinilai otomatis!");
        setIsModalVisible(false);
        // Refresh data
        if (user?.id) {
          fetchDetailData(user.id, courseId, subLessonId);
        }
      } else {
        messageApi.error("Gagal mengubah jawaban.");
      }
    } catch (e) {
      console.error(e);
      messageApi.error("Gagal mengubah jawaban.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  if (!data) return null;

  const errorLogs = data.codeLogs.filter((log: any) => log.is_error);
  const successLogs = data.codeLogs.filter((log: any) => !log.is_error);

  const getInitials = (name: string) => {
    if (!name) return "S";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {contextHolder}
      
      {/* Header Banner (Purple Theme) */}
      <Card 
        variant="borderless" 
        style={{ 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, #5B21B6 0%, #4C1D95 100%)', 
          color: '#FFFFFF',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(91, 33, 182, 0.15)'
        }} 
        styles={{ body: { padding: '24px' } }}
      >
        <Row justify="space-between" align="middle" style={{ flexWrap: "wrap", gap: "16px" }}>
          <Col>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.75)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: "1px" }}>
              Course: {data.course?.course_name || 'Java'}
            </Text>
            <Title level={3} style={{ margin: "4px 0 0 0", color: '#FFFFFF', fontWeight: 800 }}>
              {data.sublesson?.title}
            </Title>
          </Col>
          <Col>
            <Button 
              type="text" 
              icon={<ArrowLeftOutlined />} 
              onClick={() => router.push(`/student/report/${courseId}`)}
              style={{ color: '#FFFFFF', fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}
            >
              Kembali
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Score Overview (4 unique cards) */}
      <Row gutter={[20, 20]} style={{ marginBottom: '32px' }}>
        {/* Reading Score Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', backgroundColor: '#D1FAE5', height: '100%', boxShadow: "0 4px 12px rgba(16, 185, 129, 0.05)" }}
            styles={{ body: { padding: '20px', textAlign: 'center' } }}
          >
            <Text style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', display: "block", marginBottom: "8px", textTransform: 'uppercase' }}>
              Reading Score
            </Text>
            <Title level={2} style={{ margin: 0, fontWeight: 900, color: '#065F46' }}>
              {data.readScore || 0}
            </Title>
          </Card>
        </Col>

        {/* Coding Score Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', backgroundColor: '#EDE9FE', height: '100%', boxShadow: "0 4px 12px rgba(91, 33, 182, 0.05)" }}
            styles={{ body: { padding: '20px', textAlign: 'center' } }}
          >
            <Text style={{ fontSize: '12px', fontWeight: 700, color: '#5B21B6', display: "block", marginBottom: "8px", textTransform: 'uppercase' }}>
              Coding Score
            </Text>
            <Title level={2} style={{ margin: 0, fontWeight: 900, color: '#5B21B6' }}>
              {data.codingScore || 0}
            </Title>
          </Card>
        </Col>

        {/* Essay Score Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ borderRadius: '16px', backgroundColor: '#FEF3C7', height: '100%', boxShadow: "0 4px 12px rgba(245, 158, 11, 0.05)" }}
            styles={{ body: { padding: '20px', textAlign: 'center' } }}
          >
            <Text style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', display: "block", marginBottom: "8px", textTransform: 'uppercase' }}>
              Essay Score
            </Text>
            <Title level={2} style={{ margin: 0, fontWeight: 900, color: '#92400E' }}>
              {data.essayScore || 0}
            </Title>
          </Card>
        </Col>

        {/* Total Score Card */}
        <Col xs={24} sm={12} lg={6}>
          <Card 
            variant="borderless" 
            style={{ 
              borderRadius: '16px', 
              backgroundColor: '#F59E0B', 
              height: '100%', 
              boxShadow: "0 8px 20px rgba(245, 158, 11, 0.2)" 
            }}
            styles={{ body: { padding: '20px', textAlign: 'center' } }}
          >
            <Text style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', display: "block", marginBottom: "8px", textTransform: 'uppercase' }}>
              Total Score
            </Text>
            <Title level={2} style={{ margin: 0, fontWeight: 900, color: '#FFFFFF' }}>
              {data.totalScore || 0}
            </Title>
          </Card>
        </Col>
      </Row>

      {/* Main Container Card */}
      <Card 
        variant="borderless" 
        style={{ 
          borderRadius: '16px', 
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)', 
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          marginBottom: '32px'
        }}
        styles={{ body: { padding: '32px' } }}
      >
        {/* Soal Studi Kasus Area */}
        {data.codeQuestion && (
          <div style={{ marginBottom: '32px', borderBottom: '1px solid #F3F4F6', paddingBottom: '24px' }}>
            <Text style={{ display: 'block', fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Soal
            </Text>
            <Title level={4} style={{ color: '#5B21B6', fontWeight: 800, margin: '0 0 16px 0' }}>
              Studi Kasus
            </Title>
            <div 
              style={{ fontSize: '14px', lineHeight: '1.6', color: '#4B5563', marginBottom: '20px', overflowX: 'auto', maxWidth: '100%' }}
              dangerouslySetInnerHTML={{ __html: data.codeQuestion?.code_question }} 
            />
            
            {(data.codeAnswer?.answer || data.codeQuestion?.hint) && (
              <div style={{ 
                backgroundColor: '#1E1E1E', 
                borderRadius: '8px', 
                padding: '16px', 
                fontFamily: 'monospace', 
                whiteSpace: 'pre-wrap', 
                color: '#FFFFFF', 
                fontSize: '13px',
                lineHeight: 1.6,
                overflowX: 'auto',
                maxWidth: '100%'
              }}>
                {data.codeAnswer?.answer || data.codeQuestion?.hint}
              </div>
            )}
          </div>
        )}

        {/* Tab Selection */}
        <style>{`
          .report-tabs .ant-tabs-nav::before {
            border-bottom: 2px solid #F3F4F6 !important;
          }
          .report-tabs .ant-tabs-tab {
            font-size: 15px !important;
            font-weight: 600 !important;
            color: #6B7280 !important;
          }
          .report-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
            color: #5B21B6 !important;
          }
          .report-tabs .ant-tabs-ink-bar {
            background: #5B21B6 !important;
            height: 3px !important;
          }
        `}</style>
        <Tabs 
          className="report-tabs"
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: 'Code Test Report',
              children: (
                <div style={{ paddingTop: '20px' }}>
                  {/* Test Summary Columns */}
                  <div style={{ marginBottom: "28px" }}>
                    <Text style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#374151', fontSize: '14px' }}>
                      Test Summary
                    </Text>
                    <Row gutter={[16, 16]}>
                      <Col xs={8}>
                        <div style={{ border: '1px solid #EF4444', padding: '12px', borderRadius: '10px', textAlign: 'center', backgroundColor: '#FEF2F2' }}>
                          <Text style={{ fontSize: '11px', color: '#EF4444', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Errors</Text>
                          <Text style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444' }}>{errorLogs.length}</Text>
                        </div>
                      </Col>
                      <Col xs={8}>
                        <div style={{ border: '1px solid #0F766E', padding: '12px', borderRadius: '10px', textAlign: 'center', backgroundColor: '#F0FDFA' }}>
                          <Text style={{ fontSize: '11px', color: '#0F766E', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Success</Text>
                          <Text style={{ fontSize: '18px', fontWeight: 800, color: '#0F766E' }}>{successLogs.length}</Text>
                        </div>
                      </Col>
                      <Col xs={8}>
                        <div style={{ border: '1px solid #5B21B6', padding: '12px', borderRadius: '10px', textAlign: 'center', backgroundColor: '#F5F3FF' }}>
                          <Text style={{ fontSize: '11px', color: '#5B21B6', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Score</Text>
                          <Text style={{ fontSize: '18px', fontWeight: 800, color: '#5B21B6' }}>{data.codingScore}</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <Text style={{ display: 'block', marginBottom: '12px', fontWeight: 700, color: '#374151', fontSize: '14px' }}>
                    Exercise Logs
                  </Text>
                  
                  {/* Logs Container */}
                  <div style={{ 
                    backgroundColor: '#1E1E1E', 
                    borderRadius: '12px', 
                    padding: '24px',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.15)',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}>
                    {errorLogs.map((log: any) => (
                      <div key={log.id} style={{ marginBottom: '20px', borderBottom: '1px solid #333333', paddingBottom: '16px' }}>
                        <Tag color="error" style={{ borderRadius: '9999px', padding: '2px 12px', marginBottom: '8px', fontWeight: 700 }}>
                          Error
                        </Tag>
                        <pre style={{ margin: 0, color: '#F87171', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {log.message}
                        </pre>
                      </div>
                    ))}

                    {successLogs.map((log: any) => (
                      <div key={log.id} style={{ marginBottom: '20px', borderBottom: '1px solid #333333', paddingBottom: '16px' }}>
                        <Tag color="success" style={{ borderRadius: '9999px', padding: '2px 12px', marginBottom: '8px', fontWeight: 700 }}>
                          Success
                        </Tag>
                        <pre style={{ margin: 0, color: '#34D399', fontSize: '13px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {log.message}
                        </pre>
                      </div>
                    ))}

                    {data.codeLogs.length === 0 && (
                      <div style={{ textAlign: "center", padding: "24px 0" }}>
                        <Text style={{ color: '#9CA3AF' }}>Tidak ada log untuk code ini.</Text>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: 'Essay Test Report',
              children: (
                <div style={{ paddingTop: '20px' }}>
                  {data.essayDetails && data.essayDetails.length > 0 ? (
                    data.essayDetails.map((record: any, index: number) => {
                      const isApproved = record.answer?.is_approved_by_teacher;
                      const hasClass = data.user && data.user.class_id;
                      
                      return (
                        <Card 
                          key={record.question.id} 
                          variant="borderless"
                          style={{ 
                            borderRadius: '12px', 
                            border: '1px solid #E5E7EB',
                            marginBottom: '20px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                          }}
                          styles={{ body: { padding: '20px' } }}
                        >
                          {/* Top Question Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: "wrap", gap: "10px" }}>
                            <span style={{ 
                              backgroundColor: '#EDE9FE', 
                              color: '#5B21B6', 
                              padding: '3px 12px', 
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              Question {index + 1}
                            </span>
                            
                            <span style={{ 
                              backgroundColor: '#D1FAE5', 
                              color: '#065F46', 
                              padding: '3px 12px', 
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              Score: {record.score || 0}
                            </span>
                          </div>

                          {/* Question Text */}
                          <div 
                            style={{ fontSize: '15px', color: '#1F2937', fontWeight: 600, marginBottom: '20px', lineHeight: 1.5 }}
                            dangerouslySetInnerHTML={{ __html: record.question.essay_question }}
                          />

                          {/* Dual Column Layout (Your Answer vs Answer Key) */}
                          <Row gutter={[16, 16]}>
                            {/* Your Answer */}
                            <Col xs={24} md={record.question.answer_key ? 12 : 24}>
                              <Card 
                                variant="borderless"
                                style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB', height: "100%" }}
                                styles={{ body: { padding: '16px' } }}
                              >
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                  <Avatar style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 700 }}>
                                    {getInitials(data.user?.name || "Pelajar")}
                                  </Avatar>
                                  <div style={{ flex: 1 }}>
                                    <Text style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
                                      Your Answer
                                    </Text>
                                    <Paragraph style={{ margin: 0, color: '#1F2937', fontSize: '13px', lineHeight: 1.5 }}>
                                      {record.answer?.answer || '-'}
                                    </Paragraph>
                                  </div>
                                </div>
                              </Card>
                            </Col>

                            {/* Answer Key (If available) */}
                            {record.question.answer_key && (
                              <Col xs={24} md={12}>
                                <Card 
                                  variant="borderless"
                                  style={{ backgroundColor: '#ECFDF5', borderRadius: '8px', border: '1px solid #A7F3D0', height: "100%" }}
                                  styles={{ body: { padding: '16px' } }}
                                >
                                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                    <Avatar style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 700 }}>
                                      <CheckOutlined />
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                      <Text style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        Answer Key
                                      </Text>
                                      <Paragraph style={{ margin: 0, color: '#065F46', fontSize: '13px', lineHeight: 1.5 }}>
                                        {record.question.answer_key}
                                      </Paragraph>
                                    </div>
                                  </div>
                                </Card>
                              </Col>
                            )}
                          </Row>

                          {/* Teacher Notes */}
                          {record.answer?.teacher_notes && (
                            <div style={{ marginTop: '16px' }}>
                              <Card 
                                variant="borderless"
                                style={{ backgroundColor: '#FEF2F2', borderRadius: '8px', border: '1px solid #FEE2E2' }}
                                styles={{ body: { padding: '12px 16px' } }}
                              >
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#EF4444' }}>
                                  <ExclamationCircleFilled style={{ fontSize: '14px' }} />
                                  <Text style={{ fontSize: '12px', fontWeight: 700 }}>Teacher Notes:</Text>
                                </div>
                                <Text style={{ display: 'block', fontSize: '13px', color: '#DC2626', marginTop: '4px', paddingLeft: '22px' }}>
                                  {record.answer.teacher_notes}
                                </Text>
                              </Card>
                            </div>
                          )}

                          {/* Edit Answer Action Button */}
                          {hasClass && isApproved !== 1 && (
                            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                              <Button 
                                type="default" 
                                icon={<EditOutlined />}
                                onClick={() => handleEditClick(record)}
                                style={{ 
                                  borderColor: '#5B21B6', 
                                  color: '#5B21B6', 
                                  borderRadius: '8px', 
                                  fontWeight: 600 
                                }}
                              >
                                Edit Jawaban
                              </Button>
                            </div>
                          )}
                        </Card>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: "center", padding: "24px 0" }}>
                      <Text style={{ color: '#9CA3AF' }}>Tidak ada detail essay.</Text>
                    </div>
                  )}
                </div>
              ),
            }
          ]}
        />
      </Card>

      {/* Edit Essay Answer Modal */}
      <Modal
        title="Edit Jawaban Essay"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width="95%"
        style={{ top: 20, maxWidth: '600px' }}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)} style={{ borderRadius: "8px" }}>
            Batal
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submitLoading} 
            onClick={handleUpdateAnswer} 
            style={{ backgroundColor: '#5B21B6', borderColor: '#5B21B6', borderRadius: "8px" }}
          >
            Simpan Perubahan
          </Button>
        ]}
      >
        <div style={{ marginBottom: '16px', overflowX: 'auto' }}>
          <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Pertanyaan:</Text>
          <div dangerouslySetInnerHTML={{ __html: editingAnswer?.question?.essay_question || "" }} style={{ fontSize: "14px", color: "#374151" }} />
        </div>
        <div>
          <Text style={{ fontWeight: 600, display: 'block', marginBottom: '8px' }}>Jawaban Anda:</Text>
          <TextArea 
            rows={6} 
            value={newAnswerText} 
            onChange={(e) => setNewAnswerText(e.target.value)}
            placeholder="Ketik jawabanmu disini..."
            style={{ borderRadius: "8px" }}
          />
        </div>
      </Modal>

    </div>
  );
}

