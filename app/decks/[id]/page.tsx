import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireActiveLanguage } from "@/lib/guards";
import { StudySession } from "@/components/study-session";

export default async function StudyDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, languageId } = await requireActiveLanguage();
  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      cards: {
        select: {
          id: true,
          front: true,
          back: true,
          progress: { where: { userId: user.id }, select: { dueAt: true } },
        },
      },
    },
  });

  // Must exist, match the active language, and be official or owned by this user.
  if (
    !deck ||
    deck.languageId !== languageId ||
    (deck.ownerId !== null && deck.ownerId !== user.id)
  ) {
    notFound();
  }

  // Due cards first: never-studied cards (due epoch 0) and overdue ones lead.
  const cards = deck.cards
    .map((c) => ({
      id: c.id,
      front: c.front,
      back: c.back,
      due: c.progress[0]?.dueAt.getTime() ?? 0,
    }))
    .sort((a, b) => a.due - b.due)
    .map(({ id, front, back }) => ({ id, front, back }));

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <Link href="/decks" className="text-sm text-gray-500 underline">
        ← Decks
      </Link>
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      <StudySession cards={cards} />
    </main>
  );
}
