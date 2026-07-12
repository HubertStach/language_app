import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { addQuestion, deleteQuestion } from "@/lib/actions/admin";

export default async function QuizQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { languageId } = await requireAdminLanguage();
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: true },
  });
  if (!quiz || quiz.languageId !== languageId) notFound();

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{quiz.title}</h1>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Add question</h2>
        <form action={addQuestion} className="flex flex-col gap-2">
          <input type="hidden" name="quizId" value={quiz.id} />
          <input
            name="prompt"
            required
            placeholder="Prompt"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <textarea
            name="options"
            required
            rows={4}
            placeholder="One option per line"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <label className="text-sm text-gray-600">
            Correct answer number (first line = 0)
          </label>
          <input
            name="correctIndex"
            type="number"
            min={0}
            defaultValue={0}
            required
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-black py-2 font-medium text-white">
            Add question
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">{quiz.questions.length} questions</h2>
        <ul className="flex flex-col gap-2">
          {quiz.questions.map((q) => {
            const options = q.options as string[];
            return (
              <li
                key={q.id}
                className="flex items-start gap-2 rounded-lg border border-gray-200 p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{q.prompt}</div>
                  <ol className="mt-1 list-decimal pl-5 text-sm text-gray-600">
                    {options.map((o, i) => (
                      <li
                        key={i}
                        className={
                          i === q.correctIndex ? "font-medium text-green-700" : ""
                        }
                      >
                        {o}
                      </li>
                    ))}
                  </ol>
                </div>
                <form action={deleteQuestion}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="quizId" value={quiz.id} />
                  <button className="text-sm text-red-600">Delete</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <Link href="/admin/quizzes" className="text-sm underline">
        Back to quizzes
      </Link>
    </main>
  );
}
