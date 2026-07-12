import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { createQuiz, deleteQuiz } from "@/lib/actions/admin";

export default async function AdminQuizzesPage() {
  const { languageId } = await requireAdminLanguage();
  const quizzes = await prisma.quiz.findMany({
    where: { languageId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Quizzes</h1>
        <form action={createQuiz} className="flex gap-2">
          <input
            name="title"
            required
            placeholder="New quiz title"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-black px-4 font-medium text-white">
            Add
          </button>
        </form>
      </section>

      <ul className="flex flex-col gap-2">
        {quizzes.map((q) => (
          <li
            key={q.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
          >
            <Link
              href={`/admin/quizzes/${q.id}`}
              className="flex-1 font-medium"
            >
              {q.title}
            </Link>
            <span className="text-sm text-gray-400">
              {q._count.questions} Q
            </span>
            <form action={deleteQuiz}>
              <input type="hidden" name="id" value={q.id} />
              <button className="text-sm text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {quizzes.length === 0 && (
          <li className="text-gray-500">No quizzes yet.</li>
        )}
      </ul>
    </main>
  );
}
