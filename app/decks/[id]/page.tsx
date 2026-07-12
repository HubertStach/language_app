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
      cards: { select: { id: true, front: true, back: true } },
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

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">{deck.title}</h1>
      <StudySession cards={deck.cards} />
      <Link href="/decks" className="text-center text-sm underline">
        Back to decks
      </Link>
    </main>
  );
}
