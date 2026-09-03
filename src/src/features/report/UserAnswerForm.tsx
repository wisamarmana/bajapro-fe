"use client";
import { Card, Tag, Input, Button, Form, message, Space, Typography, Table, Modal, Alert } from 'antd';
import { useRouter } from 'next/navigation';
import { useApproval } from "@/src/hooks/report/useApproval";
import { reportApi } from "@/src/actions/report/reportApi";
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, BulbOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function UserAnswerForm({ userId, subLessonId }: { userId: string, subLessonId: string }) {
  const router = useRouter();
  const { data, loading, updateGrade, updateProgress } = useApproval(userId, subLessonId);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState<string[]>(["", "", ""]);

  const onApprove = async () => {
    try {
      if (!data?.essayAnswers || data.essayAnswers.length === 0) {
        messageApi.error("Jawaban esai tidak ditemukan!");
        return;
      }
      const values = form.getFieldsValue();
      await Promise.all(data.essayAnswers.map(ea => {
        const isQ1 = data.essayQuestions[0] && ea.essay_question_id == data.essayQuestions[0].id;
        const isQ2 = data.essayQuestions[1] && ea.essay_question_id == data.essayQuestions[1].id;
        const isQ3 = data.essayQuestions[2] && ea.essay_question_id == data.essayQuestions[2].id;

        return updateGrade(ea.id, {
          ...ea,
          konteks_penjelasan: isQ1 ? values.konteks_penjelasan : (ea.konteks_penjelasan || 0),
          keruntutan: isQ2 ? values.keruntutan : (ea.keruntutan || 0),
          kebenaran: isQ3 ? values.kebenaran : (ea.kebenaran || 0),
          is_approved_by_teacher: 1,
          teacher_notes: ""
        });
      }));
      messageApi.success("Jawaban berhasil di-Approve!");
      router.back();
    } catch (e) {
      messageApi.error("Gagal menyimpan penilaian!");
    }
  };

  const onReject = async () => {
    if (rejectNotes.some(n => !n.trim())) {
      messageApi.error("Semua catatan (Notes) wajib diisi saat melakukan Reject!");
      return;
    }
    if (!data?.essayAnswers || data.essayAnswers.length === 0) {
      messageApi.error("Jawaban esai tidak ditemukan!");
      return;
    }
    try {
      const values = form.getFieldsValue();
      await Promise.all(data.essayAnswers.map((ea: any) => {
        const isQ1 = data.essayQuestions[0] && ea.essay_question_id == data.essayQuestions[0].id;
        const isQ2 = data.essayQuestions[1] && ea.essay_question_id == data.essayQuestions[1].id;
        const isQ3 = data.essayQuestions[2] && ea.essay_question_id == data.essayQuestions[2].id;

        let note = "";
        if (isQ1) note = rejectNotes[0];
        if (isQ2) note = rejectNotes[1];
        if (isQ3) note = rejectNotes[2];

        return updateGrade(ea.id, {
          ...ea,
          konteks_penjelasan: isQ1 ? values.konteks_penjelasan : (ea.konteks_penjelasan || 0),
          keruntutan: isQ2 ? values.keruntutan : (ea.keruntutan || 0),
          kebenaran: isQ3 ? values.kebenaran : (ea.kebenaran || 0),
          is_approved_by_teacher: 0,
          teacher_notes: note
        });
      }));
      messageApi.success("Jawaban berhasil di-Reject!");
      setIsRejectModalOpen(false);
      router.back();
    } catch (e) {
      messageApi.error("Gagal menyimpan penilaian!");
    }
  };

  if (loading) return <div className="p-6">Memuat data...</div>;
  if (!data || !data.sublesson) return <div className="p-6 text-center text-gray-500 font-medium">Data laporan tidak ditemukan atau siswa belum memulai modul ini.</div>;

  const errorCount = data?.logs?.filter((l: any) => l.is_error).length || 0;
  const successCount = data?.logs?.filter((l: any) => !l.is_error).length || 0;

  const wonderingScore = data?.wonderingScore?.score || 0;
  const exploringScore = data?.codeAnswer?.exploring_score || 0;

  let explainScore = 0;
  if (data?.essayAnswers) {
    data.essayAnswers.forEach((ea: any) => {
      explainScore += (ea.keruntutan || 0) + (ea.kebenaran || 0) + (ea.konteks_penjelasan || 0);
    });
  }

  const totalScore = wonderingScore + exploringScore + explainScore;

  // Mocking values based on UI since API mapping is not fully perfect yet
  const summaryColumns = [
    { title: 'Wondering Score', dataIndex: 'wondering', align: 'center' as const },
    { title: 'Exploring Score', dataIndex: 'exploring', align: 'center' as const },
    { title: 'Explain Score', dataIndex: 'explain', align: 'center' as const },
    { title: 'Total Score', dataIndex: 'total', align: 'center' as const },
  ];

  const summaryData = [{
    key: '1',
    wondering: wonderingScore,
    exploring: exploringScore,
    explain: explainScore,
    total: totalScore
  }];

  const caseColumns = [
    { title: 'Jumlah Errors', dataIndex: 'errors', align: 'center' as const },
    { title: 'Jumlah Success', dataIndex: 'success', align: 'center' as const },
    { title: 'Exploring Score', dataIndex: 'exploring', align: 'center' as const },
  ];

  const caseData = [{
    key: '1',
    errors: errorCount || 0,
    success: successCount || 0,
    exploring: exploringScore
  }];

  const approvalStatus = data?.essayAnswers?.[0]?.is_approved_by_teacher;
  const statusText = approvalStatus === 1 ? "Approved" : approvalStatus === 0 ? "Rejected" : "Pending";
  const statusColor = approvalStatus === 1 ? "green" : approvalStatus === 0 ? "red" : "orange";

  return (
    <div className="bg-gray-50 min-h-screen">
      {contextHolder}
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shadow-sm bg-white p-4 px-6 rounded-xl">
        <div className="flex items-center gap-4">
          <Title level={4} style={{ margin: 0 }}>Result Hasil Belajar :</Title>
          <Text style={{ fontSize: '18px', color: '#6b21a8', fontWeight: 600 }}>{data?.user?.name || 'Loading...'}</Text>
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

      {/* Main Content Area */}
      <div className="bg-white shadow-sm rounded-xl p-8 mb-6">

        {/* Title Sub Lesson */}
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <div>
            <Text type="secondary" className="text-base">Sub lesson</Text>
            <Title level={3} style={{ margin: '4px 0 0 0', color: '#6b21a8' }}>{data?.sublesson?.title || 'Loading...'}</Title>
          </div>
          <Tag color={statusColor} style={{ borderRadius: '12px', padding: '4px 16px', fontSize: '14px' }}>{statusText}</Tag>
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <Text className="text-gray-500 mb-2 block">Summary Penilaian</Text>
          <Table
            dataSource={summaryData}
            columns={summaryColumns}
            pagination={false}
            bordered
            size="middle"
          />
        </div>

      </div>

      <div className="bg-white shadow-sm rounded-xl p-8 mb-6">
        {/* Soal Studi Kasus */}
        <div className="mb-10">
          <Text type="secondary" className="block mb-2">Soal</Text>
          <Title level={4} style={{ color: '#6b21a8', marginTop: 0 }}>Studi Kasus</Title>

          <div className="bg-white border border-gray-200 rounded-lg p-6 my-4 shadow-sm">
            <div dangerouslySetInnerHTML={{ __html: data?.codeQuestion?.code_question || 'Tidak ada soal studi kasus' }} />
          </div>

          <Text className="block mb-2 text-gray-500">Penilaian</Text>
          <Table
            dataSource={caseData}
            columns={caseColumns}
            pagination={false}
            bordered
            size="middle"
          />
        </div>
      </div>

      <Form form={form} layout="vertical" initialValues={{
        konteks_penjelasan: data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[0]?.id)?.konteks_penjelasan || 0,
        keruntutan: data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[1]?.id)?.keruntutan || 0,
        kebenaran: data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[2]?.id)?.kebenaran || 0
      }}>
        <div className="bg-white shadow-sm rounded-xl p-8 mb-6">
          <div>
            <Text type="secondary" className="block mb-2">Soal</Text>
            <Title level={4} style={{ color: '#6b21a8', marginTop: 0, marginBottom: 24 }}>Esai</Title>


            <Alert
              title="Ubah nilai jawaban pelajar apabila belum sesuai dengan rekomendasi sistem."
              type="success"
              showIcon
              style={{ marginBottom: '24px', backgroundColor: '#f6ffed', borderColor: '#b7eb8f', color: '#389e0d' }}
            />

            <div className="space-y-6">
              {/* Question 1: Konteks Penjelasan */}
              <div className="bg-white p-0 rounded-lg border-none">
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Pertanyaan</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <div className="text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: data?.essayQuestions?.[0]?.essay_question || 'Tidak ada pertanyaan' }} />
                </div>
                
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Jawaban User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Text className="text-gray-700">{data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[0]?.id)?.answer || 'Belum ada jawaban'}</Text>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <Text type="secondary" className="w-32 flex-shrink-0">Nilai User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Form.Item name="konteks_penjelasan" noStyle>
                    <Input type="number" min={0} max={100} className="!w-24 text-center rounded-md font-semibold" size="large" />
                  </Form.Item>
                </div>
              </div>

              {/* Question 2: Keruntutan */}
              <div className="bg-white p-0 rounded-lg border-none">
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Pertanyaan</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <div className="text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: data?.essayQuestions?.[1]?.essay_question || 'Tidak ada pertanyaan' }} />
                </div>
                
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Jawaban User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Text className="text-gray-700">{data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[1]?.id)?.answer || 'Belum ada jawaban'}</Text>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <Text type="secondary" className="w-32 flex-shrink-0">Nilai User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Form.Item name="keruntutan" noStyle>
                    <Input type="number" min={0} max={100} className="!w-24 text-center rounded-md font-semibold" size="large" />
                  </Form.Item>
                </div>
              </div>

              {/* Question 3: Kebenaran */}
              <div className="bg-white p-0 rounded-lg border-none">
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Pertanyaan</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <div className="text-gray-800 font-medium" dangerouslySetInnerHTML={{ __html: data?.essayQuestions?.[2]?.essay_question || 'Tidak ada pertanyaan' }} />
                </div>
                
                <div className="mb-4 flex items-start gap-4">
                  <Text type="secondary" className="w-32 flex-shrink-0">Jawaban User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Text className="text-gray-700">{data?.essayAnswers?.find((ea: any) => ea.essay_question_id == data?.essayQuestions?.[2]?.id)?.answer || 'Belum ada jawaban'}</Text>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <Text type="secondary" className="w-32 flex-shrink-0">Nilai User</Text>
                  <Text className="flex-shrink-0">:</Text>
                  <Form.Item name="kebenaran" noStyle>
                    <Input type="number" min={0} max={100} className="!w-24 text-center rounded-md font-semibold" size="large" />
                  </Form.Item>
                </div>
              </div>
            </div>
          </div>



        </div>

                  {/* Actions */}
          {Number(approvalStatus) !== 1 && (
            <div className="flex justify-center gap-4 mt-8">
              <Button
                type="primary"
                danger
                size="large"
                icon={<CloseOutlined />}
                style={{ borderRadius: '8px', padding: '0 32px' }}
                onClick={() => setIsRejectModalOpen(true)}
              >
                Reject
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                style={{ backgroundColor: '#22c55e', borderRadius: '8px', padding: '0 32px' }}
                onClick={onApprove}
              >
                Approve
              </Button>
            </div>
          )}

      </Form>

      {/* Reject Modal */ }
  <Modal
    title="Reject Jawaban"
    open={isRejectModalOpen}
    onOk={onReject}
    onCancel={() => setIsRejectModalOpen(false)}
    okText="Konfirmasi Reject"
    okButtonProps={{ danger: true }}
    width={600}
  >
    <div className="py-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
      {data?.essayQuestions?.map((q: any, i: number) => (
        <div key={q.id} className="mb-6">
          <Text className="block mb-2 font-medium">Catatan Soal {i + 1}:</Text>
          <div className="text-xs text-gray-500 mb-2" dangerouslySetInnerHTML={{ __html: q.essay_question }} />
          <Input.TextArea
            rows={3}
            placeholder={`Berikan alasan penolakan untuk pertanyaan ${i + 1}...`}
            value={rejectNotes[i]}
            onChange={(e) => {
              const newNotes = [...rejectNotes];
              newNotes[i] = e.target.value;
              setRejectNotes(newNotes);
            }}
            status={!rejectNotes[i].trim() ? 'error' : ''}
          />
        </div>
      ))}
      {rejectNotes.some(n => !n.trim()) && (
        <Text type="danger" className="text-sm mt-1 block">Semua catatan wajib diisi agar murid dapat memperbaikinya.</Text>
      )}
    </div>
  </Modal>

    </div >
  );
}
