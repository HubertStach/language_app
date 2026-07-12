import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { addCard, deleteCard } from "@/lib/actions/admin";

export default async function DeckCardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { languageId } = await requireAdminLanguage();
  const { id } = await params;

  const deck = await prisma.deck.findUnique({
    where: { id },
    include: {
      cards: { include: { word: { select: { text: true } } } },
    },
  });
  if (!deck || deck.languageId !== languageId) notFound();

  // Words available to link a card to.
  const words = await prisma.word.findMany({
    where: { languageId },
    orderBy: { text: "asc" },
    select: { id: true, text: true, translation: true },
  });

  return (
    <main className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{deck.title}</h1>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Add card</h2>
        <form action={addCard} className="flex flex-col gap-2">
          <input type="hidden" name="deckId" value={deck.id} />
          <input
            name="front"
            required
            placeholder="Front"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            name="back"
            required
            placeholder="Back"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <select
            name="wordId"
            defaultValue=""
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">Link a word (optional)</option>
            {words.map((w) => (
              <option key={w.id} value={w.id}>
                {w.text} — {w.translation}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-black py-2 font-medium text-white">
            Add card
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">{deck.cards.length} cards</h2>
        <ul className="flex flex-col gap-2">
          {deck.cards.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.front}</div>
                <div className="truncate text-sm text-gray-600">
                  {c.back}
                  {c.word && ` · 🔗 ${c.word.text}`}
                </div>
              </div>
              <form action={deleteCard}>
                <input type="hidden" name="id" value={c.id} />
                <input type="hidden" name="deckId" value={deck.id} />
                <button className="text-sm text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/admin/decks" className="text-sm underline">
        Back to decks
      </Link>
    </main>
  );
}
