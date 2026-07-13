import Link from "next/link";
import { requireActiveLanguage } from "@/lib/guards";
import { prisma } from "@/lib/db";
import { RandomSession } from "@/components/random-session";

export const dynamic = "force-dynamic"; // re-shuffle on every visit

const LIMIT = 20;

export default async function RandomPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { user, languageId } = await requireActiveLanguage();
  const isSentence = (await searchParams).kind === "SENTENCE";

  // Cards from decks in the active language the user can study (official + own),
  // filtered to the requested kind. Freeform cards (no linked word) count as words.
  const cards = await prisma.card.findMany({
    where: {
      deck: { languageId, OR: [{ ownerId: null }, { ownerId: user.id }] },
      ...(isSentence
        ? { word: { kind: "SENTENCE" } }
        : { OR: [{ word: { kind: "WORD" } }, { wordId: null }] }),
    },
    select: { id: true, front: true, back: true },
  });

  // Shuffle (Fisher-Yates) and take up to LIMIT — distinct rows, so no repeats.
  for (let j = cards.length - 1; j > 0; j--) {
    const k = Math.floor(Math.random() * (j + 1));
    [cards[j], cards[k]] = [cards[k], cards[j]];
  }
  const picked = cards.slice(0, LIMIT);

  return (
    <main className="mx-auto flex min-h-dvh w-full min-w-0 max-w-sm flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-gray-500 underline">
        ← Learn
      </Link>
      <h1 className="text-2xl font-semibold">
        Random {isSentence ? "sentences" : "flashcards"}
      </h1>
      <RandomSession cards={picked} />
    </main>
  );
}
