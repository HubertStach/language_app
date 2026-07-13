import { prisma } from "@/lib/db";
import { requireActiveLanguage } from "@/lib/guards";
import { getFeed } from "@/lib/feed";
import { FeedCard } from "@/components/feed-card";

export const dynamic = "force-dynamic"; // per-user language; upstream fetches are cached

function relativeDate(d?: Date) {
  if (!d) return null;
  const hours = Math.round((Date.now() - d.getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default async function HomePage() {
  const { languageId } = await requireActiveLanguage();
  const language = await prisma.language.findUnique({
    where: { id: languageId },
    select: { code: true, name: true, feedSources: { select: { name: true, url: true } } },
  });
  if (!language) return null; // guard already redirects; satisfies TS

  const items = await getFeed(language.code, language.feedSources);

  return (
    <main className="mx-auto flex min-h-dvh w-full min-w-0 max-w-md flex-col gap-4 px-3 py-6">
      <h1 className="text-2xl font-semibold">Today in {language.name}</h1>

      {items.length === 0 && (
        <p className="text-gray-500">
          Nothing to read yet — sources may be unreachable. Try again later.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.url + item.source}>
            <FeedCard
              source={item.source}
              title={item.title}
              snippet={item.snippet}
              url={item.url}
              imageUrl={item.imageUrl}
              dateLabel={relativeDate(item.publishedAt)}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
