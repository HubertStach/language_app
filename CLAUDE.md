@AGENTS.md

# Language Learning App

Mobile-first webapp for learning a language: flashcards, quizzes, a browsable word/sentence repository, and a news feed in the target language. Real users, real auth.

**Focus: Spanish only for now.** The schema is multi-language (`activeLanguageId` filters all content), and es/fr/de/it are seeded, but content and testing target Spanish. Don't build per-language special cases.

## Stack

- **Next.js 16.2 App Router** — see AGENTS.md warning: read `node_modules/next/dist/docs/` before coding. Middleware is renamed `proxy.ts`. `cacheComponents` is NOT enabled — use the previous caching model (`next: { revalidate }` on fetch).
- **PostgreSQL** (Docker locally) + **Prisma**; generated client lives in `app/generated/prisma`.
- **Auth.js (NextAuth v5)** — email/password (bcrypt) + optional Google. JWT session carries `id` + `role` only; active language is always read fresh from the DB (`lib/guards.ts`).
- **Zod** on every Server Action input.
- **Tailwind 4**, mobile-first (375 px). Bottom tab nav: Home (feed) / Learn / Words / Quizzes / Profile (`components/bottom-nav.tsx`).

## Data model

```
User        id, email, passwordHash?, name, role (USER | ADMIN), activeLanguageId
Language    id, code, name
Word        id, languageId, text, translation, wordType, kind (WORD | SENTENCE)
Tag         id, languageId, name              — Word ↔ Tag many-to-many
Deck        id, languageId, title, ownerId    — ownerId null = official/admin deck
Card        id, deckId, front, back, wordId?
Progress    userId+cardId, box (1–5), dueAt   — Leitner (lib/leitner.ts)
Quiz/Question                                 — admin-authored (player not built)
FeedSource  id, languageId, name, url         — RSS 2.0 feeds for the Home tab
```

Sentences are NOT a separate model — a `Word` with `kind = SENTENCE`. All word machinery (cards, decks, import, quizzes, flashcards) is shared; pages filter by `kind`.

## Key flows

- **Import**: admin uploads CSV (`content, language, meaning, tag`) → words + tags + one official deck per tag + linked cards (`lib/import-words.ts`). Idempotent; a word/sentence toggle on the form.
- **Translations**: `;` in a translation = multiple senses; `normalizeSenses` (`lib/text.ts`) rewrites to `, ` at every write boundary (import, admin CRUD). Flashcard render also applies it for legacy rows.
- **Study**: `StudySession` (`components/study-session.tsx`) covers both deck study (`persist` → Leitner via `reviewCard`) and throwaway random sets (`/random`, score only). Cards show the word first; tap flips to the translation.
- **Quizzes**: `/quizzes/random` generates 20 multiple-choice questions from words (`?kind=SENTENCE` for sentences) via `lib/quiz.ts` — correct translation + 3 distractors of the same kind. Client-side score only; admin-authored Quiz/Question have no player yet.
- **Feed**: Home tab shows Wikipedia daily featured content (automatic per language code) + admin-managed RSS sources (`lib/feed.ts`, `lib/rss.ts`, `/admin/feeds`). No scraping, no cron — fetch cache with `revalidate: 1800`, `Promise.allSettled` tolerates dead feeds. Parser prefers `content:encoded` (full body, capped ~1200 chars) over `description`. External text is stripped to plain text — never render feed HTML. Cards tap-to-expand the text (`components/feed-card.tsx`); image stays fixed height.

## Conventions

- Reads: Server Components query Prisma directly. Writes: Server Actions. No `/api` routes unless an external consumer needs one.
- Authorization in every page/action (ownership check on mutations, admin check server-side). `proxy.ts` does only optimistic redirects — not the auth layer.
- Integrity via DB constraints (unique, FK cascades), not app code.
- UI language is English; only learning content is multilingual — no i18n framework.
- Non-trivial pure logic gets a `lib/*.check.ts` self-check (assert-based, run with `npx tsx lib/<name>.check.ts`) — see leitner/quiz/rss/csv/text.
- One Prisma migration per change-set; keep `prisma/seed.ts` working (languages + admin user + feed sources).

## Status / what's left

Done: foundation (auth, languages, settings), words + admin CRUD + CSV import, flashcards (Leitner decks + random sets), sentences, random word/sentence quizzes, Home feed.

Not built yet:
- **Quiz persistence** — no `QuizResult` model; scores are client-only. No player for admin-authored quizzes. No dashboard (streak, due today).
- **Hardening** — rate limiting on auth, password reset email, error pages, Playwright smoke test (auth + study flows).

## Deployment (Vercel)

- Build command (`vercel.json`): `prisma generate && prisma migrate deploy && next build` — **migrations auto-apply to prod on every deploy** (idempotent, never resets).
- **Seed data does NOT run on prod.** Languages/admin were seeded once; new seed rows (e.g. feed sources) don't propagate. Add feeds on prod via **/admin/feeds** (admin-managed by design — don't re-seed on deploy, it would resurrect deleted feeds).
- Prod `DATABASE_URL` may be marked "Sensitive" in Vercel (unreadable), so seeding prod from a laptop isn't always possible — the admin UI is the intended path.

## Commands

- `npm run dev` / `npm run build` / `npm run lint`
- `npx prisma migrate dev` / `npx prisma db seed` (admin@example.com / admin1234)
- `docker compose up -d` — local Postgres (must be running; `ECONNREFUSED` means it isn't)
