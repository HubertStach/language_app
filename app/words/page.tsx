import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireActiveLanguage } from "@/lib/guards";
import { WordType } from "@/app/generated/prisma/enums";

const WORD_TYPES = Object.values(WordType);

type SearchParams = Promise<{ q?: string; type?: string; tag?: string }>;

export default async function WordsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { languageId } = await requireActiveLanguage();
  const { q = "", type = "", tag = "" } = await searchParams;

  const typeFilter = WORD_TYPES.includes(type as WordType)
    ? (type as WordType)
    : undefined;

  const [words, tags] = await Promise.all([
    prisma.word.findMany({
      where: {
        languageId,
        wordType: typeFilter,
        tags: tag ? { some: { name: tag } } : undefined,
        ...(q
          ? {
              OR: [
                { text: { contains: q, mode: "insensitive" } },
                { translation: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { tags: { select: { name: true } } },
      orderBy: { text: "asc" },
      take: 200,
    }),
    prisma.tag.findMany({
      where: { languageId },
      orderBy: { name: "asc" },
      select: { name: true },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-4 p-6">
      <Link href="/" className="text-sm text-gray-500 underline">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Words</h1>

      <form method="get" className="flex flex-col gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search word or translation"
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <div className="flex gap-2">
          <select
            name="type"
            defaultValue={type}
            className="flex-1 rounded-lg border border-gray-300 px-2 py-2"
          >
            <option value="">All types</option>
            {WORD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.toLowerCase()}
              </option>
            ))}
          </select>
          <select
            name="tag"
            defaultValue={tag}
            className="flex-1 rounded-lg border border-gray-300 px-2 py-2"
          >
            <option value="">All tags</option>
            {tags.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <button className="rounded-lg bg-black py-2 font-medium text-white">
          Filter
        </button>
      </form>

      <p className="text-sm text-gray-500">{words.length} results</p>

      <ul className="flex flex-col gap-2">
        {words.map((w) => (
          <li key={w.id} className="rounded-lg border border-gray-200 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{w.text}</span>
              <span className="text-xs uppercase text-gray-400">
                {w.wordType.toLowerCase()}
              </span>
            </div>
            <div className="text-gray-600">{w.translation}</div>
            {w.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {w.tags.map((t) => (
                  <span
                    key={t.name}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
        {words.length === 0 && (
          <li className="text-gray-500">No words yet.</li>
        )}
      </ul>
    </main>
  );
}
