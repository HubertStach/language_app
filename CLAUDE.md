@AGENTS.md

# Language Learning App

Mobile-first webapp for learning a language: flashcards (official + user-created), quizzes (admin-created), and a browsable word repository. Real users, real auth.

## Stack

- **Next.js 16.2 App Router** — see AGENTS.md warning: read `node_modules/next/dist/docs/` before coding. Middleware is renamed `proxy.ts` in this version.
- **PostgreSQL** (Docker locally, RDS-compatible) + **Prisma** for schema/migrations.
- **Auth.js (NextAuth v5)** — email/password (bcrypt) + Google. `role` field gates admin.
- **Zod** on every Server Action input.
- **Tailwind 4**, mobile-first (design at 375 px, desktop = wider margins). Bottom tab nav: Learn / Words / Quizzes / Profile.

## Data model

```
User        id, email, passwordHash?, name, role (USER | ADMIN), activeLanguageId
Language    id, code, name
Word        id, languageId, text, translation, wordType (NOUN | VERB | ADJECTIVE | ...)
Tag         id, languageId, name              — Word ↔ Tag many-to-many
Deck        id, languageId, title, ownerId    — ownerId null = official/admin deck
Card        id, deckId, front, back, wordId?  — admin cards link a Word; user cards freeform
Quiz        id, languageId, title             — admin-created only
Question    id, quizId, prompt, options (json), correctIndex
Progress    userId+cardId, box (1–5), dueAt   — Leitner spaced repetition
QuizResult  userId, quizId, score, takenAt
```

`activeLanguageId` = the language the user is learning (changeable in settings); all content queries filter by it.

## Conventions

- Reads: Server Components query Prisma directly. Writes: Server Actions. No `/api` routes unless an external consumer needs one.
- Authorization is enforced in every Server Action / page (ownership check on mutations, admin check server-side). `proxy.ts` does only optimistic redirects — it is not the auth layer.
- Enforce integrity with DB constraints (unique, FK cascades), not app code.
- UI language is English; only learning content is multilingual — no i18n framework.
- Spaced repetition is Leitner (box int + dueAt date), not SM-2.
- One Prisma migration per phase; keep the seed script (languages + admin user) working.

## Build phases

1. **Foundation** — Postgres + Prisma schema + seed; Auth.js signup/login; `proxy.ts` redirects; language picker + settings.
2. **Words + admin** — `/words` browse/search/filter; `/admin` role-gated CRUD (words, tags, decks, quizzes).
3. **Flashcards** — official + user decks; study screen (flip card, knew-it/didn't → Leitner update, due cards first).
4. **Quizzes** — multiple-choice player, results, simple dashboard (streak, due today).
5. **Hardening** — rate limiting on auth, password reset email, error pages, Playwright smoke test (auth + study flows).

## Commands

- `npm run dev` / `npm run build` / `npm run lint`
