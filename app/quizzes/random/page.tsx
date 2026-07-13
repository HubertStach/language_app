import Link from "next/link";
import { requireActiveLanguage } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { buildRandomQuiz } from "@/lib/quiz";
import { QuizPlayer } from "@/components/quiz-player";

export const dynamic = "force-dynamic"; // new random quiz each visit

export default async function RandomQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { languageId } = await requireActiveLanguage();
  const isSentence = (await searchParams).kind === "SENTENCE";

  const words = await prisma.word.findMany({
    where: { languageId, kind: isSentence ? "SENTENCE" : "WORD" },
    select: { text: true, translation: true },
  });

  const questions = buildRandomQuiz(words);

  return (
    <main className="mx-auto flex min-h-dvh w-full min-w-0 max-w-sm flex-col gap-6 p-6">
      <Link href="/quizzes" className="text-sm text-gray-500 underline">
        ← Quizzes
      </Link>
      <h1 className="text-2xl font-semibold">
        Random {isSentence ? "sentences" : "words"}
      </h1>
      <QuizPlayer questions={questions} />
    </main>
  );
}
