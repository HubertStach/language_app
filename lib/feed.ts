import { parseRss, cleanText } from "@/lib/rss";

export type FeedItem = {
  source: string;
  title: string;
  snippet: string;
  url: string;
  imageUrl?: string;
  publishedAt?: Date;
};

type RssSource = { name: string; url: string };

const REVALIDATE = { next: { revalidate: 1800 } }; // upstream hit ≤ every 30 min
const RSS_ITEMS_PER_SOURCE = 10;
const MOSTREAD_COUNT = 5;

// Wikipedia page-summary shape (tfa, mostread articles, news links all use it).
type WikiSummary = {
  normalizedtitle?: string;
  titles?: { normalized?: string };
  extract?: string;
  thumbnail?: { source?: string };
  content_urls?: { desktop?: { page?: string } };
};

function wikiItem(source: string, s: WikiSummary, snippet?: string): FeedItem | null {
  const title = s.normalizedtitle ?? s.titles?.normalized;
  const url = s.content_urls?.desktop?.page;
  if (!title || !url) return null;
  return {
    source,
    title,
    snippet: snippet ?? s.extract ?? "",
    url,
    imageUrl: s.thumbnail?.source,
  };
}

/** Wikipedia's daily featured content for a language — no key, no config. */
async function fetchWikipedia(code: string): Promise<FeedItem[]> {
  const now = new Date();
  const date = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${String(now.getUTCDate()).padStart(2, "0")}`;
  const res = await fetch(
    `https://${code}.wikipedia.org/api/rest_v1/feed/featured/${date}`,
    { ...REVALIDATE, headers: { "user-agent": "language-app/0.1" } },
  );
  if (!res.ok) throw new Error(`wikipedia ${res.status}`);
  const data: {
    tfa?: WikiSummary;
    mostread?: { articles?: WikiSummary[] };
    news?: { story?: string; links?: WikiSummary[] }[];
  } = await res.json();

  const items: (FeedItem | null)[] = [];
  if (data.tfa) items.push(wikiItem("Wikipedia · featured", data.tfa));
  for (const n of data.news ?? []) {
    const first = n.links?.[0];
    if (first) items.push(wikiItem("Wikipedia · in the news", first, cleanText(n.story ?? "")));
  }
  for (const a of (data.mostread?.articles ?? []).slice(0, MOSTREAD_COUNT)) {
    items.push(wikiItem("Wikipedia · most read", a));
  }
  return items.filter((i): i is FeedItem => i !== null);
}

async function fetchRssSource(source: RssSource): Promise<FeedItem[]> {
  const res = await fetch(source.url, {
    ...REVALIDATE,
    headers: { "user-agent": "language-app/0.1" },
  });
  if (!res.ok) throw new Error(`${source.name} ${res.status}`);
  return parseRss(await res.text())
    .slice(0, RSS_ITEMS_PER_SOURCE)
    .map((i) => ({
      source: source.name,
      title: i.title,
      snippet: i.description,
      url: i.link,
      publishedAt: i.pubDate,
    }));
}

/** All sources combined; a dead source contributes nothing instead of failing the page. */
export async function getFeed(languageCode: string, sources: RssSource[]): Promise<FeedItem[]> {
  const results = await Promise.allSettled([
    fetchWikipedia(languageCode),
    ...sources.map(fetchRssSource),
  ]);
  const items = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  // Dated items newest first; undated (Wikipedia daily) items are spread into
  // random slots instead of clumping at the top. Page is force-dynamic, so the
  // order reshuffles per visit — fine for a daily-discovery feed.
  const feed = items
    .filter((i) => i.publishedAt)
    .sort((a, b) => b.publishedAt!.getTime() - a.publishedAt!.getTime());
  for (const item of items.filter((i) => !i.publishedAt)) {
    feed.splice(Math.floor(Math.random() * (feed.length + 1)), 0, item);
  }
  return feed;
}
