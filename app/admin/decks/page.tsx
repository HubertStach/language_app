import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { createDeck, deleteDeck } from "@/lib/actions/admin";

export default async function AdminDecksPage() {
  const { languageId } = await requireAdminLanguage();
  // Official decks only (ownerId null); user decks are managed by their owners.
  const decks = await prisma.deck.findMany({
    where: { languageId, ownerId: null },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { cards: true } } },
  });

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Decks</h1>
        <form action={createDeck} className="flex gap-2">
          <input
            name="title"
            required
            placeholder="New deck title"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-black px-4 font-medium text-white">
            Add
          </button>
        </form>
      </section>

      <ul className="flex flex-col gap-2">
        {decks.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
          >
            <Link href={`/admin/decks/${d.id}`} className="flex-1 font-medium">
              {d.title}
            </Link>
            <span className="text-sm text-gray-400">{d._count.cards} cards</span>
            <form action={deleteDeck}>
              <input type="hidden" name="id" value={d.id} />
              <button className="text-sm text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {decks.length === 0 && <li className="text-gray-500">No decks yet.</li>}
      </ul>
    </main>
  );
}
