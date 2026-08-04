import { Suspense } from "react"; // 1. Import Suspense dari React
import ClassTable from "@/src/components/features/report/ClassTable";

export default async function ClassListPage({ 
  params 
}: { 
  params: Promise<{ classId: string }> 
}) {
  const resolvedParams = await params;

  return (
    <div className="p-6">
      {/* 2. Bungkus komponen dengan Suspense */}
      <Suspense fallback={<div>Memuat data tabel...</div>}>
        <ClassTable classId={resolvedParams.classId} />
      </Suspense>
    </div>
  );
}