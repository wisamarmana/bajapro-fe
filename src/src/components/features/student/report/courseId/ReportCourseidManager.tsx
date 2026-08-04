"use client";
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Progress, Button, Table, Tag, Spin, message } from "antd";
import { ArrowLeftOutlined, StarFilled, WalletFilled, ClockCircleFilled, FolderFilled, TrophyOutlined } from "@ant-design/icons";
import { useRouter, useParams } from "next/navigation";
import { getStudentCourseReportApi } from "@/src/actions/student/studentApi";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/src/hooks/useAuth";

const { Title, Text } = Typography;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }
};

export default function ReportCourseidManager() {
  const router = useRouter();
  const params = useParams();
  const courseId = Number(params?.courseId);

  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (user?.id && courseId) {
      fetchReportData(user.id, courseId);
    }
  }, [courseId, user?.id]);

  const fetchReportData = async (studentId: number, cId: number) => {
    try {
      setLoading(true);
      const res = await getStudentCourseReportApi(studentId, cId);
      setData(res);
    } catch (e) {
      console.error(e);
      message.error("Gagal memuat data report.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><Spin size="large" /></div>;
  }

  if (!data) return null;

  const columns = [
    {
      title: 'No',
      dataIndex: 'index',
      key: 'index',
      render: (text: any, record: any, index: number) => (
        <Text style={{ fontWeight: 600, color: "#6B7280" }}>{index + 1}</Text>
      ),
      width: 60,
      align: 'center' as const
    },
    {
      title: 'Sub Lesson',
      dataIndex: ['sublesson', 'title'],
      key: 'title',
      render: (text: string) => <Text style={{ fontWeight: 600, color: '#1F2937' }}>{text}</Text>,
    },
    {
      title: 'Total Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
      align: 'center' as const,
      render: (val: number) => <Text style={{ fontWeight: 700, color: '#5B21B6' }}>{val}</Text>,
    },
    {
      title: 'Read Score',
      dataIndex: 'readScore',
      key: 'readScore',
      align: 'center' as const,
      render: (val: number) => <Text style={{ color: '#4B5563' }}>{val}</Text>,
    },
    {
      title: 'Coding Score',
      dataIndex: 'codingScore',
      key: 'codingScore',
      align: 'center' as const,
      render: (val: number) => <Text style={{ color: '#4B5563' }}>{val}</Text>,
    },
    {
      title: 'Essay Score',
      dataIndex: 'essayScore',
      key: 'essayScore',
      align: 'center' as const,
      render: (val: number) => <Text style={{ color: '#4B5563' }}>{val}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      render: (status: string) => {
        if (status === 'Approve' || status === 'APPROVED') {
          return (
            <Tag style={{
              borderRadius: '9999px',
              padding: '2px 14px',
              background: '#D1FAE5',
              border: '1px solid #10B981',
              color: '#065F46',
              fontWeight: 700
            }}>
              ✓ Approve
            </Tag>
          );
        }
        if (status === 'Rejected' || status === 'REJECTED') {
          return (
            <Tag style={{
              borderRadius: '9999px',
              padding: '2px 14px',
              background: '#FEE2E2',
              border: '1px solid #F87171',
              color: '#991B1B',
              fontWeight: 700
            }}>
              ✗ Rejected
            </Tag>
          );
        }
        return (
          <Tag style={{
            borderRadius: '9999px',
            padding: '2px 14px',
            background: '#FEF3C7',
            border: '1px solid #FBBF24',
            color: '#92400E',
            fontWeight: 700
          }}>
            Pending
          </Tag>
        );
      }
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center' as const,
      render: (text: any, record: any) => (
        <Button
          type="primary"
          onClick={() => router.push(`/student/report/${courseId}/${record.sublesson.id}`)}
          style={{
            backgroundColor: '#5B21B6',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600
          }}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ maxWidth: '1200px', margin: '0 auto' }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: "28px" }}>
        <Row justify="space-between" align="middle" style={{ flexWrap: "wrap", gap: "16px" }}>
          <Col>
            <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: "28px", color: '#1F2937' }}>
              Report Course: <span style={{ color: '#5B21B6' }}>{data.course?.course_name || 'Java'}</span>
            </Title>
            <Text style={{ color: "#6B7280", fontSize: "14px" }}>
              Analisis detail performa dan nilai Anda dalam course ini.
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push(`/student/level/${courseId}`)}
              style={{ backgroundColor: '#2563EB', borderRadius: '8px', border: 'none', fontWeight: 600, height: "38px" }}
            >
              Kembali
            </Button>
          </Col>
        </Row>
      </motion.div>

      {/* 4 Cards */}
      <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
        <Row gutter={[24, 24]}>
          {/* Card 1: Current Badge */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', height: '100%', border: "1px solid #E5E7EB" }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>Current Badge</Text>
                <div style={{ backgroundColor: '#FEF3C7', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <StarFilled style={{ color: '#FBBF24', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrophyOutlined style={{ fontSize: "28px", color: "#FBBF24" }} />
                <Title level={4} style={{ margin: 0, fontWeight: 800, color: '#1F2937' }}>
                  {data.badge?.name || 'Beginner'}
                </Title>
              </div>
            </Card>
          </Col>

          {/* Card 2: Total Score */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', height: '100%', border: "1px solid #E5E7EB" }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>Total Score</Text>
                <div style={{ backgroundColor: '#D1FAE5', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <WalletFilled style={{ color: '#10B981', fontSize: '14px' }} />
                </div>
              </div>
              <Title level={2} style={{ margin: 0, fontWeight: 800, color: '#1F2937' }}>
                {data.studentCourse?.total_score || 0}
              </Title>
            </Card>
          </Col>

          {/* Card 3: Progress */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', height: '100%', border: "1px solid #E5E7EB" }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>Progress</Text>
                <div style={{ backgroundColor: '#DBEAFE', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <ClockCircleFilled style={{ color: '#1E40AF', fontSize: '14px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Progress percent={data.progressPercent} showInfo={false} strokeColor="#5B21B6" style={{ flex: 1 }} />
                <Text style={{ fontWeight: 800, color: "#1F2937" }}>{data.progressPercent}%</Text>
              </div>
            </Card>
          </Col>

          {/* Card 4: Finished Test */}
          <Col xs={24} sm={12} lg={6}>
            <Card
              variant="borderless"
              style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', height: '100%', border: "1px solid #E5E7EB" }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                <Text style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280' }}>Finished Test</Text>
                <div style={{ backgroundColor: '#FCE7F3', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                  <FolderFilled style={{ color: '#EC4899', fontSize: '14px' }} />
                </div>
              </div>
              <Title level={3} style={{ margin: 0, fontWeight: 800, color: '#1F2937' }}>
                {data.finishedTests} <span style={{ color: '#9CA3AF', fontSize: '18px', fontWeight: 500 }}>/ {data.totalTests || 25}</span>
              </Title>
            </Card>
          </Col>
        </Row>
      </motion.div>

      {/* Table Card */}
      <motion.div variants={itemVariants}>
        <Card
          variant="borderless"
          style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', border: "1px solid #E5E7EB", overflow: "hidden" }}
          styles={{ body: { padding: 0 } }}
        >
          <style>{`
            .custom-table .ant-table-thead > tr > th {
              background-color: #EDE9FE !important;
              color: #1F2937 !important;
              font-weight: 700 !important;
              border-bottom: 2px solid #E5E7EB !important;
            }
            .custom-table .ant-table-tbody > tr > td {
              border-bottom: 1px solid #F3F4F6 !important;
              padding: 16px !important;
            }
            .custom-table .ant-table-row:hover > td {
              background-color: #EDE9FE20 !important;
            }
          `}</style>
          <Table
            className="custom-table"
            columns={columns}
            dataSource={data.reportData}
            rowKey={(record: any) => record.sublesson.id}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
            style={{ width: '100%' }}
          />
        </Card>
      </motion.div>
    </motion.div>
  );
}

