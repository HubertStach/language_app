// Run: npx tsx lib/rss.check.ts
import assert from "node:assert";
import { parseRss, cleanText } from "./rss";

const xml = `<?xml version="1.0"?>
<rss version="2.0"><channel>
  <title>Feed title, not an item</title>
  <item>
    <title><![CDATA[Ondata di calore &amp; sole]]></title>
    <link>https://example.com/a</link>
    <description><![CDATA[<p>Testo <b>con</b> HTML &#8211; e entit&agrave;.</p>]]></description>
    <pubDate>Sun, 13 Jul 2026 08:00:00 GMT</pubDate>
  </item>
  <item>
    <title>Second</title>
    <link>https://example.com/b</link>
    <description>short</description>
    <content:encoded><![CDATA[<p>Much longer full body text.</p>]]></content:encoded>
  </item>
  <item><title>No link, skipped</title></item>
</channel></rss>`;

const items = parseRss(xml);
assert.strictEqual(items.length, 2, "two valid items, invalid skipped");
assert.strictEqual(items[0].title, "Ondata di calore & sole", "CDATA + entity");
assert.strictEqual(items[0].link, "https://example.com/a");
assert.ok(!items[0].description.includes("<"), "tags stripped");
assert.ok(items[0].description.startsWith("Testo con HTML"), "text kept");
assert.strictEqual(items[0].pubDate?.toISOString(), "2026-07-13T08:00:00.000Z");
assert.strictEqual(items[1].pubDate, undefined, "missing date ok");
assert.strictEqual(items[1].description, "Much longer full body text.", "content:encoded preferred");
assert.strictEqual(cleanText("a &#233; b"), "a é b", "numeric entity");
assert.strictEqual(cleanText("<script>x</script>safe"), "x safe", "no markup survives");
assert.strictEqual(
  cleanText("&lt;img src=&quot;x.jpg&quot;&gt;pie de foto"),
  "pie de foto",
  "entity-encoded HTML stripped too",
);

console.log("rss ok");
