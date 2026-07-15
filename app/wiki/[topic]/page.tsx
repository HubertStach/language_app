import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { WIKI_TOPICS } from "@/lib/wiki";

export default async function WikiTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  await requireUser();
  const { topic } = await params;
  const entry = WIKI_TOPICS.find((t) => t.slug === topic);
  if (!entry) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-4 p-6">
      <Link href="/wiki" className="text-sm text-gray-500 underline">
        ← Wiki
      </Link>
      <h1 className="text-2xl font-semibold">{entry.title}</h1>
      <p className="text-gray-500">Nothing here yet.</p>
    </main>
  );
}
