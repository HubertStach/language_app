import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { createFeedSource, deleteFeedSource } from "@/lib/actions/admin";

export default async function AdminFeedsPage() {
  const { languageId } = await requireAdminLanguage();
  const feeds = await prisma.feedSource.findMany({
    where: { languageId },
    orderBy: { name: "asc" },
  });

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Feeds</h1>
        <p className="text-sm text-gray-500">
          RSS 2.0 feeds shown on the Home tab for this language. Wikipedia is
          always included automatically.
        </p>
        <form action={createFeedSource} className="flex flex-col gap-2">
          <input
            name="name"
            required
            placeholder="Source name (e.g. Tagesschau)"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <input
            name="url"
            type="url"
            required
            placeholder="https://example.com/rss.xml"
            className="rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-black py-2 font-medium text-white">
            Add feed
          </button>
        </form>
      </section>

      <ul className="flex flex-col gap-2">
        {feeds.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium">{f.name}</div>
              <div className="truncate text-sm text-gray-500">{f.url}</div>
            </div>
            <form action={deleteFeedSource}>
              <input type="hidden" name="id" value={f.id} />
              <button className="text-sm text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {feeds.length === 0 && <li className="text-gray-500">No feeds yet.</li>}
      </ul>
    </main>
  );
}
