import QuestionForm from "@/src/components/features/code_question/QuestionForm";

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  // const currentId = Number(id);

  return (
    <div>
      <QuestionForm questionId={id} />
    </div>
  );
}