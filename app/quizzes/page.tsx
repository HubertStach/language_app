import Link from "next/link";
import { requireActiveLanguage } from "@/lib/guards";

export default async function QuizzesPage() {
  await requireActiveLanguage();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Quizzes</h1>
      <Link
        href="/quizzes/random"
        className="rounded-lg border border-gray-300 py-3 text-center font-medium"
      >
        Random words
      </Link>
      <Link
        href="/quizzes/random?kind=SENTENCE"
        className="rounded-lg border border-gray-300 py-3 text-center font-medium"
      >
        Random sentences
      </Link>
    </main>
  );
}
