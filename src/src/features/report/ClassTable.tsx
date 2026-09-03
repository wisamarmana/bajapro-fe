"use client";

import { Table, Button, Typography, Card, Tag, Alert } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { useClass, FilteredStudent } from "@/src/hooks/report/useClass"; // <-- Perhatikan path ini
import { ColumnsType } from 'antd/es/table';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface ClassTableProps {
  classId: string;
}

export default function ClassTable({ classId }: ClassTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Mengambil courseId dari URL, misalnya: ?course=1
  const courseId = searchParams.get('course') || '';
  const className = searchParams.get('className') || classId; 
  const courseName = searchParams.get('courseName') || courseId;

  // Menarik data pakai Hook yang sudah kita buat
  const { students, loading, error } = useClass(classId, courseId);

  console.log("Data Murid:", students); // Debugging: cek data yang diterima
  

  // Konfigurasi Kolom Ant Design
  const columns: ColumnsType<FilteredStudent> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nama Murid',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Total Score',
      dataIndex: 'totalScore',
      key: 'totalScore',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record: any) => {
        let color = 'orange';
        if (record.status === 'approve' || record.status === 'approved') color = 'green';
        if (record.status === 'reject' || record.status === 'rejected') color = 'red';
        return (
          <Tag color={color} style={{ borderRadius: '12px', padding: '2px 10px', textTransform: 'capitalize' }}>
            {record.status || 'Pending'}
          </Tag>
        )
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          onClick={() => router.push(`/report/${classId}/${record.id}?course=${courseId}`)}
        >
          Lihat Progress
        </Button>
      ),
    },
  ];

  if (error) {
    return <Alert message="Error Fetching Data" description={error} type="error" showIcon className="mb-4" />;
  }

  return (
    <div>
    <div
        className="flex justify-between items-center mb-6 shadow-sm"
        style={{
          backgroundColor: "white",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <Button 
          color="default"
          variant="filled"
          size="large"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/report")}
        >
          Kembali
        </Button>
      </div>
    <Card className="shadow-sm">
      <div className="mb-2 flex justify-between items-center">
        <Typography.Title level={4} style={{ margin: 0 }}>
          Daftar Murid
        </Typography.Title>
        <Typography.Text type="secondary">
          Total: {students.length} Murid
        </Typography.Text>
      </div>

      <div className="mb-4">
        <Typography.Text type="secondary">
             Kelas {className} - Course {courseName}
        </Typography.Text>
      </div>

      <Table 
        columns={columns} 
        dataSource={students} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'Tidak ada murid yang mengambil course ini di kelas tersebut' }}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />
    </Card>

    </div>
  );
}
