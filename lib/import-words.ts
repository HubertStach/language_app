import { prisma } from "@/lib/db";
import { parseCsv } from "@/lib/csv";

export type ImportResult =
  | { error: string }
  | { imported: number; skipped: number; errors: string[] };

// Accept a few obvious header spellings; maps to canonical names.
const HEADER_ALIASES: Record<string, string> = {
  content: "content",
  word: "content",
  text: "content",
  language: "language",
  lang: "language",
  meaning: "meaning",
  translation: "meaning",
  tag: "tag",
  tags: "tag",
};

const UNCATEGORIZED_DECK = "Uncategorized";

type WordCard = { id: string; text: string; translation: string };

/**
 * Core CSV -> words import. Pure of auth/caching so it can be tested directly.
 * Resolves language per row (by code or name), auto-creates missing tags, and
 * builds flashcards: one official deck per tag (tagless words go to an
 * "Uncategorized" deck), a Word-linked card per word.
 *
 * Idempotent: re-importing skips existing words but still ensures their tags,
 * decks and cards exist — so a re-import backfills any missing flashcards.
 */
export async function importWordsFromCsv(csvText: string): Promise<ImportResult> {
  const rows = parseCsv(csvText).filter((r) => r.some((c) => c.trim() !== ""));
  if (rows.length < 2) return { error: "CSV has no data rows" };

  const header = rows[0].map(
    (h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? h.trim().toLowerCase(),
  );
  const ci = header.indexOf("content");
  const li = header.indexOf("language");
  const mi = header.indexOf("meaning");
  const ti = header.indexOf("tag");
  if (ci < 0 || li < 0 || mi < 0) {
    return { error: "CSV needs content, language and meaning columns" };
  }

  // Resolve languages by code or name (case-insensitive).
  const languages = await prisma.language.findMany();
  const langByKey = new Map<string, string>();
  for (const l of languages) {
    langByKey.set(l.code.toLowerCase(), l.id);
    langByKey.set(l.name.toLowerCase(), l.id);
  }

  const tagCache = new Map<string, string>(); // `${languageId}:${lower(name)}` -> tagId
  const deckCache = new Map<string, string>(); // `${languageId}:${lower(title)}` -> deckId
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const content = (row[ci] ?? "").trim();
    const meaning = (row[mi] ?? "").trim();
    const langKey = (row[li] ?? "").trim().toLowerCase();

    if (!content || !meaning || !langKey) {
      errors.push(`Row ${r + 1}: missing content/language/meaning`);
      continue;
    }
    const languageId = langByKey.get(langKey);
    if (!languageId) {
      errors.push(`Row ${r + 1}: unknown language "${row[li]}"`);
      continue;
    }

    const tagNames = splitTags(ti >= 0 ? (row[ti] ?? "") : "");
    const tagIds = await resolveTags(languageId, tagNames, tagCache);
    const connectTags = { connect: tagIds.map((tagId) => ({ id: tagId })) };

    // Find-or-create the word so re-import is idempotent.
    let word = await prisma.word.findFirst({
      where: { languageId, text: content, translation: meaning },
    });
    if (word) {
      skipped++;
      if (tagIds.length > 0) {
        word = await prisma.word.update({
          where: { id: word.id },
          data: { tags: connectTags },
        });
      }
    } else {
      word = await prisma.word.create({
        data: { languageId, text: content, translation: meaning, tags: connectTags },
      });
      imported++;
    }

    // Ensure a flashcard exists in each tag's deck (or Uncategorized).
    const deckTitles = tagNames.length > 0 ? tagNames : [UNCATEGORIZED_DECK];
    for (const title of deckTitles) {
      const deckId = await ensureDeck(languageId, title, deckCache);
      await ensureCard(deckId, word);
    }
  }

  return { imported, skipped, errors };
}

/**
 * Build decks/cards for words that already exist in the DB (e.g. imported
 * before flashcards were auto-created). Safe to run repeatedly.
 */
export async function backfillFlashcards() {
  const deckCache = new Map<string, string>();
  const words = await prisma.word.findMany({
    include: { tags: { select: { name: true } } },
  });
  let created = 0;
  for (const w of words) {
    const titles = w.tags.length > 0 ? w.tags.map((t) => t.name) : [UNCATEGORIZED_DECK];
    for (const title of titles) {
      const deckId = await ensureDeck(w.languageId, title, deckCache);
      if (await ensureCard(deckId, w)) created++;
    }
  }
  return { words: words.length, cardsCreated: created };
}

function splitTags(cell: string) {
  return cell
    .split(";")
    .map((t) => t.trim())
    .filter(Boolean);
}

// Missing tags are created (unique per language).
async function resolveTags(
  languageId: string,
  names: string[],
  cache: Map<string, string>,
) {
  const ids: string[] = [];
  for (const name of names) {
    const key = `${languageId}:${name.toLowerCase()}`;
    let tagId = cache.get(key);
    if (!tagId) {
      const tag = await prisma.tag.upsert({
        where: { languageId_name: { languageId, name } },
        update: {},
        create: { languageId, name },
      });
      tagId = tag.id;
      cache.set(key, tagId);
    }
    ids.push(tagId);
  }
  return ids;
}

// Find-or-create an official (ownerId null) deck by title for the language.
// ponytail: findFirst instead of a unique constraint — avoids a nullable-owner
// unique index; the per-import cache keeps it to one lookup per title.
async function ensureDeck(
  languageId: string,
  title: string,
  cache: Map<string, string>,
) {
  const key = `${languageId}:${title.toLowerCase()}`;
  let deckId = cache.get(key);
  if (!deckId) {
    const existing = await prisma.deck.findFirst({
      where: { languageId, title, ownerId: null },
      select: { id: true },
    });
    deckId =
      existing?.id ??
      (await prisma.deck.create({ data: { languageId, title } })).id;
    cache.set(key, deckId);
  }
  return deckId;
}

// Create a Word-linked card in the deck unless one already exists. Returns
// whether it created one.
async function ensureCard(deckId: string, word: WordCard) {
  const existing = await prisma.card.findFirst({
    where: { deckId, wordId: word.id },
    select: { id: true },
  });
  if (existing) return false;
  await prisma.card.create({
    data: { deckId, front: word.text, back: word.translation, wordId: word.id },
  });
  return true;
}
