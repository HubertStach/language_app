import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { WIKI_TOPICS } from "@/lib/wiki";

export default async function WikiPage() {
  await requireUser();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Wiki</h1>

      <div className="grid grid-cols-2 gap-3">
        {WIKI_TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/wiki/${t.slug}`}
            className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-center font-medium text-indigo-950"
          >
            {t.title}
          </Link>
        ))}
      </div>

      <Link
        href="/words"
        className="rounded-lg border border-gray-300 py-2 text-center text-sm font-medium"
      >
        Browse all words
      </Link>
    </main>
  );
}
