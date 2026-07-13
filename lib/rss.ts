// Minimal RSS 2.0 item extractor, same spirit as lib/csv.ts.
// ponytail: hand-rolled instead of an XML dep — RSS 2.0 only; add Atom/RDF
// parsing if a wanted feed ever needs it.

export type RssItem = {
  title: string;
  link: string;
  description: string; // plain text, tags stripped
  pubDate?: Date;
};

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

// Unwrap CDATA, strip tags, decode common entities, then strip AGAIN —
// feeds often entity-encode their HTML (&lt;img ...&gt;), so decoding can
// re-create markup. External content is rendered as plain text only.
export function cleanText(raw: string): string {
  const stripTags = (s: string) => s.replace(/<[^>]*>/g, " ");
  const decoded = stripTags(raw.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&[a-z]+;|&#39;/gi, (e) => ENTITIES[e.toLowerCase()] ?? " ");
  return stripTags(decoded).replace(/\s+/g, " ").trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return m ? m[1] : "";
}

const MAX_TEXT = 1200; // keep payload sane when content:encoded is a whole article

export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const block = m[0];
    const title = cleanText(tag(block, "title"));
    const link = cleanText(tag(block, "link"));
    if (!title || !link) continue;
    const date = new Date(cleanText(tag(block, "pubDate")));
    // Prefer the full-text body (content:encoded) over the usual one-line description.
    const description = cleanText(tag(block, "content:encoded")) || cleanText(tag(block, "description"));
    items.push({
      title,
      link,
      description: description.slice(0, MAX_TEXT),
      pubDate: isNaN(date.getTime()) ? undefined : date,
    });
  }
  return items;
}
