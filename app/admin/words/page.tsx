import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { WordForm } from "@/components/word-form";
import { ImportWordsForm } from "@/components/import-words-form";
import { createWord, deleteWord } from "@/lib/actions/admin";

export default async function AdminWordsPage() {
  const { languageId } = await requireAdminLanguage();
  const [words, tags] = await Promise.all([
    prisma.word.findMany({
      where: { languageId },
      include: { tags: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({
      where: { languageId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">New word</h1>
        <WordForm action={createWord} tags={tags} submitLabel="Add word" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">Import CSV</h2>
        <ImportWordsForm />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">{words.length} words</h2>
        <ul className="flex flex-col gap-2">
          {words.map((w) => (
            <li
              key={w.id}
              className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  {w.text}{" "}
                  <span className="text-xs uppercase text-gray-400">
                    {w.wordType.toLowerCase()}
                  </span>
                </div>
                <div className="truncate text-sm text-gray-600">
                  {w.translation}
                  {w.tags.length > 0 &&
                    ` · ${w.tags.map((t) => t.name).join(", ")}`}
                </div>
              </div>
              <Link
                href={`/admin/words/${w.id}`}
                className="text-sm underline"
              >
                Edit
              </Link>
              <form action={deleteWord}>
                <input type="hidden" name="id" value={w.id} />
                <button className="text-sm text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
