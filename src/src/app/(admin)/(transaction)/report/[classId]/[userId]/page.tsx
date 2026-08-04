import UserProgress from "@/src/components/features/report/UserProgress";

export default async function UserProgressPage({ params }: { params: Promise<{ classId: string, userId: string }> }) {
  const resolvedParams = await params;
  return (
    <div className="p-6">
      <UserProgress classId={resolvedParams.classId} userId={resolvedParams.userId} />
    </div>
  );
}