// Run against the dev DB: npx tsx lib/import-words.check.ts
import "dotenv/config";
import assert from "node:assert";
import { importWordsFromCsv } from "./import-words";
import { prisma } from "./db";

// Distinct markers so the check is self-contained and re-runnable.
const TAG = "zzcheck";
const WORDS = ["zzalpha", "zzbeta"];

const csv = `content,language,meaning,tag
${WORDS[0]},es,alpha-meaning,${TAG}
${WORDS[1]},Spanish,beta-meaning,${TAG};zzother
,es,missingcontent,
xxx,klingon,yyy,`;

async function cleanup(languageId: string) {
  // Decks cascade-delete their cards.
  await prisma.deck.deleteMany({
    where: { languageId, title: { in: [TAG, "zzother"] } },
  });
  await prisma.word.deleteMany({
    where: { languageId, text: { in: WORDS } },
  });
  await prisma.tag.deleteMany({
    where: { languageId, name: { in: [TAG, "zzother"] } },
  });
}

async function main() {
  const es = await prisma.language.findUniqueOrThrow({ where: { code: "es" } });
  await cleanup(es.id);

  const res = await importWordsFromCsv(csv);
  console.log(res);
  assert(!("error" in res), "should not be a structural error");
  if ("error" in res) return;

  assert.strictEqual(res.imported, 2, "2 valid rows imported");
  assert.strictEqual(res.errors.length, 2, "missing-content + unknown-language");

  // Re-import: idempotent — words now skipped, no duplicate cards created.
  const again = await importWordsFromCsv(csv);
  assert(!("error" in again) && again.imported === 0, "re-import creates nothing new");

  // A deck named after the tag exists and has a card per word (2 words).
  const deck = await prisma.deck.findFirstOrThrow({
    where: { languageId: es.id, title: TAG, ownerId: null },
    include: { cards: { include: { word: { select: { text: true } } } } },
  });
  assert.strictEqual(deck.cards.length, 2, `${TAG} deck has 2 cards`);
  assert(
    deck.cards.every((c) => c.word && WORDS.includes(c.word.text)),
    "cards are linked to the imported words",
  );

  // Second word's extra tag -> its own deck too.
  const other = await prisma.deck.findFirstOrThrow({
    where: { languageId: es.id, title: "zzother", ownerId: null },
    include: { cards: true },
  });
  assert.strictEqual(other.cards.length, 1, "zzother deck has 1 card");

  await cleanup(es.id);
  console.log("import-words ok");
}

main().finally(() => prisma.$disconnect());
