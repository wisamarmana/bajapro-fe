import UserAnswerForm from "@/src/components/features/report/UserAnswerForm";

export default async function DetailAnswerPage({ params }: { params: Promise<{ classId: string, userId: string, id: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-6">
      <UserAnswerForm userId={resolvedParams.userId} subLessonId={resolvedParams.id} />
    </div>
  );
}