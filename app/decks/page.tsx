import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireActiveLanguage } from "@/lib/guards";

export default async function DecksPage() {
  const { user, languageId } = await requireActiveLanguage();

  // Official decks (ownerId null) + this user's own decks, for their language.
  const decks = await prisma.deck.findMany({
    where: { languageId, OR: [{ ownerId: null }, { ownerId: user.id }] },
    orderBy: [{ ownerId: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { cards: true } } },
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-4 p-6">
      <Link href="/" className="text-sm text-gray-500 underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Decks</h1>

      <ul className="flex flex-col gap-2">
        {decks.map((d) => (
          <li key={d.id}>
            <Link
              href={`/decks/${d.id}`}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
            >
              <span className="flex-1 font-medium">{d.title}</span>
              <span className="text-sm text-gray-400">
                {d._count.cards} cards
              </span>
            </Link>
          </li>
        ))}
        {decks.length === 0 && (
          <li className="text-gray-500">No decks for this language yet.</li>
        )}
      </ul>
    </main>
  );
}
