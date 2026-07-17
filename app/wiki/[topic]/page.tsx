import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { WIKI_TOPICS, WIKI_CONTENT } from "@/lib/wiki";

export default async function WikiTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  await requireUser();
  const { topic } = await params;
  const entry = WIKI_TOPICS.find((t) => t.slug === topic);
  if (!entry) notFound();

  const sections = WIKI_CONTENT[topic];

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-4 p-6">
      <Link href="/wiki" className="text-sm text-gray-500 underline">
        ← Wiki
      </Link>
      <h1 className="text-2xl font-semibold">{entry.title}</h1>

      {!sections && <p className="text-gray-500">Nothing here yet.</p>}

      {sections?.map((s, i) => (
        <section key={i} className="flex flex-col gap-2">
          {s.title && <h2 className="font-semibold">{s.title}</h2>}
          {s.notes?.map((n, j) => (
            <p key={j} className="text-sm text-gray-600">
              {n}
            </p>
          ))}
          {s.rows && (
            <table className="w-full overflow-hidden rounded-xl border border-indigo-200 text-sm">
              <thead>
                <tr className="bg-indigo-50 text-left text-indigo-950">
                  <th className="px-3 py-2 font-medium">Español</th>
                  <th className="px-3 py-2 font-medium">Polski</th>
                </tr>
              </thead>
              <tbody>
                {s.rows.map(([es, pl]) => (
                  <tr key={es} className="border-t border-indigo-100">
                    <td className="px-3 py-2">{es}</td>
                    <td className="px-3 py-2 text-gray-600">{pl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}
    </main>
  );
}
