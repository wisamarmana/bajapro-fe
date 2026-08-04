"use client";
import { Table, Tag, Button, Card, Row, Col, Typography, Progress } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProgress } from "@/src/hooks/report/useProgress";
import { ArrowLeftOutlined, StarFilled, WalletFilled, ClockCircleFilled, FolderFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function UserProgress({ classId, userId }: { classId: string, userId: string }) {
  const router = useRouter();
  const courseId = useSearchParams().get('course');
  const { data, loading, error } = useProgress(userId, courseId || '');

  const progressData = data?.tableData || [];
  const user = data?.user;
  const currentBadge = data?.currentBadge;
  const studentCourse = data?.studentCourse;
  const completedCount = data?.completedCount || 0;
  const totalCount = data?.totalCount || 0;
  const progressPercentage = data?.progressPercentage || 0;
  const totalScore = studentCourse?.total_score || 0;

  const columns = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    { title: 'Sub Lesson', dataIndex: 'sub_lesson_name', key: 'sub_lesson_name' },
    { title: 'Total Score', dataIndex: 'total_score', align: 'center' as const },
    { title: 'Wondering Score', dataIndex: 'wondering_score', align: 'center' as const },
    { title: 'Exploring Score', dataIndex: 'exploring_score', align: 'center' as const },
    { title: 'Explain Score', dataIndex: 'explain_score', align: 'center' as const },
    { 
      title: 'Status Approval', 
      dataIndex: 'status',
      align: 'center' as const,
      render: (status: string) => {
        let color = 'orange';
        if (status === 'approve' || status === 'approved') color = 'green';
        if (status === 'reject' || status === 'rejected') color = 'red';
        return (
          <Tag color={color} style={{ borderRadius: '12px', padding: '2px 10px', textTransform: 'capitalize' }}>
            {status || 'Pending'}
          </Tag>
        )
      }
    },
    { 
      title: 'Action', 
      align: 'center' as const,
      render: (record: any) => (
        <Button 
          type="primary"
          style={{ backgroundColor: '#6b21a8', borderRadius: '6px' }}
          onClick={() => router.push(`/report/${classId}/${userId}/${record.sub_lesson_id}?course=${courseId}`)}
        >
          Detail
        </Button>
      ) 
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div
        className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 shadow-sm"
        style={{
          backgroundColor: "white",
          padding: "16px 24px",
          borderRadius: "12px",
        }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <Title level={4} style={{ margin: 0 }}>Result Hasil Belajar :</Title>
          <Text style={{ fontSize: '18px', color: '#6b21a8', fontWeight: 600 }}>{user?.name || 'Loading...'}</Text>
        </div>
        <Button 
          color="default"
          variant="filled"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
        >
          Kembali
        </Button>
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl" style={{ height: '100%' }} styles={{ body: { padding: '16px 24px' } }}>
            <div className="flex justify-between items-start mb-2">
              <Text type="secondary" className="font-semibold">Current Badge</Text>
              <div className="bg-yellow-100 p-1 rounded"><StarFilled className="text-yellow-500" /></div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {currentBadge?.image ? (
                <img src={currentBadge.image} alt="badge" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              )}
              <Title level={3} style={{ margin: 0 }}>{currentBadge?.name || 'No Badge'}</Title>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl" style={{ height: '100%' }} styles={{ body: { padding: '16px 24px' } }}>
            <div className="flex justify-between items-start mb-2">
              <Text type="secondary" className="font-semibold">Total Score</Text>
              <div className="bg-green-100 p-1 rounded"><WalletFilled className="text-green-500" /></div>
            </div>
            <Title level={2} style={{ margin: '16px 0 0 0' }}>{totalScore}</Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl" style={{ height: '100%' }} styles={{ body: { padding: '16px 24px' } }}>
            <div className="flex justify-between items-start mb-2">
              <Text type="secondary" className="font-semibold">Progress</Text>
              <div className="bg-cyan-100 p-1 rounded"><ClockCircleFilled className="text-cyan-500" /></div>
            </div>
            <div className="mt-4">
              <Progress percent={progressPercentage} strokeColor="#06b6d4" />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl" style={{ height: '100%' }} styles={{ body: { padding: '16px 24px' } }}>
            <div className="flex justify-between items-start mb-2">
              <Text type="secondary" className="font-semibold">Finished Test</Text>
              <div className="bg-pink-100 p-1 rounded"><FolderFilled className="text-pink-500" /></div>
            </div>
            <Title level={2} style={{ margin: '16px 0 0 0' }}>{completedCount} <span className="text-gray-400 text-lg">/ {totalCount}</span></Title>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm rounded-xl" styles={{ body: { padding: '24px' } }}>
        <Table 
          dataSource={progressData} 
          columns={columns} 
          loading={loading} 
          rowKey="sub_lesson_id" 
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
          footer={() => <span className="text-gray-500">Total {progressData.length} items</span>}
        />
      </Card>
    </div>
  );
}
