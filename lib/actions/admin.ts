"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, requireAdminLanguage } from "@/lib/guards";
import { WordType } from "@/app/generated/prisma/enums";
import { importWordsFromCsv } from "@/lib/import-words";

const id = z.string().min(1);
const nonEmpty = z.string().trim().min(1);

// ---- Words ----

const wordSchema = z.object({
  text: nonEmpty,
  translation: nonEmpty,
  wordType: z.enum(WordType),
  tagIds: z.array(id),
});

function parseWord(formData: FormData) {
  return wordSchema.parse({
    text: formData.get("text"),
    translation: formData.get("translation"),
    wordType: formData.get("wordType"),
    tagIds: formData.getAll("tagIds"),
  });
}

export async function createWord(formData: FormData) {
  const { languageId } = await requireAdminLanguage();
  const data = parseWord(formData);
  await prisma.word.create({
    data: {
      languageId,
      text: data.text,
      translation: data.translation,
      wordType: data.wordType,
      tags: { connect: data.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });
  revalidatePath("/admin/words");
}

export async function updateWord(formData: FormData) {
  await requireAdmin();
  const wordId = id.parse(formData.get("id"));
  const data = parseWord(formData);
  await prisma.word.update({
    where: { id: wordId },
    data: {
      text: data.text,
      translation: data.translation,
      wordType: data.wordType,
      tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
    },
  });
  revalidatePath("/admin/words");
}

export async function deleteWord(formData: FormData) {
  await requireAdmin();
  await prisma.word.delete({ where: { id: id.parse(formData.get("id")) } });
  revalidatePath("/admin/words");
}

// ---- CSV bulk import ----

export type ImportState = {
  ok?: boolean;
  imported?: number;
  skipped?: number;
  errors?: string[];
  error?: string;
};

export async function importWords(
  _prev: ImportState,
  formData: FormData,
): Promise<ImportState> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a .csv file" };
  }

  const res = await importWordsFromCsv(await file.text());
  if ("error" in res) return { error: res.error };

  revalidatePath("/admin/words");
  revalidatePath("/words");
  return { ok: true, ...res, errors: res.errors.slice(0, 10) };
}

// ---- Tags ----

export async function createTag(formData: FormData) {
  const { languageId } = await requireAdminLanguage();
  const name = nonEmpty.parse(formData.get("name"));
  // Unique per language enforced by DB; ignore duplicates.
  await prisma.tag.upsert({
    where: { languageId_name: { languageId, name } },
    update: {},
    create: { languageId, name },
  });
  revalidatePath("/admin/tags");
  revalidatePath("/admin/words");
}

export async function deleteTag(formData: FormData) {
  await requireAdmin();
  await prisma.tag.delete({ where: { id: id.parse(formData.get("id")) } });
  revalidatePath("/admin/tags");
}

// ---- Decks + cards ----

export async function createDeck(formData: FormData) {
  const { languageId } = await requireAdminLanguage();
  const title = nonEmpty.parse(formData.get("title"));
  // ownerId null => official/admin deck.
  await prisma.deck.create({ data: { languageId, title } });
  revalidatePath("/admin/decks");
}

export async function deleteDeck(formData: FormData) {
  await requireAdmin();
  await prisma.deck.delete({ where: { id: id.parse(formData.get("id")) } });
  revalidatePath("/admin/decks");
}

export async function addCard(formData: FormData) {
  await requireAdmin();
  const deckId = id.parse(formData.get("deckId"));
  const front = nonEmpty.parse(formData.get("front"));
  const back = nonEmpty.parse(formData.get("back"));
  const wordId = formData.get("wordId");
  await prisma.card.create({
    data: {
      deckId,
      front,
      back,
      wordId: typeof wordId === "string" && wordId ? wordId : null,
    },
  });
  revalidatePath(`/admin/decks/${deckId}`);
}

export async function deleteCard(formData: FormData) {
  await requireAdmin();
  const cardId = id.parse(formData.get("id"));
  const deckId = id.parse(formData.get("deckId"));
  await prisma.card.delete({ where: { id: cardId } });
  revalidatePath(`/admin/decks/${deckId}`);
}

// ---- Quizzes + questions ----

export async function createQuiz(formData: FormData) {
  const { languageId } = await requireAdminLanguage();
  const title = nonEmpty.parse(formData.get("title"));
  await prisma.quiz.create({ data: { languageId, title } });
  revalidatePath("/admin/quizzes");
}

export async function deleteQuiz(formData: FormData) {
  await requireAdmin();
  await prisma.quiz.delete({ where: { id: id.parse(formData.get("id")) } });
  revalidatePath("/admin/quizzes");
}

const questionSchema = z
  .object({
    quizId: id,
    prompt: nonEmpty,
    // one option per line in a textarea
    options: z
      .string()
      .transform((s) => s.split("\n").map((o) => o.trim()).filter(Boolean)),
    correctIndex: z.coerce.number().int().min(0),
  })
  .refine((q) => q.options.length >= 2, {
    message: "Need at least 2 options",
  })
  .refine((q) => q.correctIndex < q.options.length, {
    message: "Correct answer number is out of range",
  });

export async function addQuestion(formData: FormData) {
  await requireAdmin();
  const q = questionSchema.parse({
    quizId: formData.get("quizId"),
    prompt: formData.get("prompt"),
    options: formData.get("options"),
    correctIndex: formData.get("correctIndex"),
  });
  await prisma.question.create({
    data: {
      quizId: q.quizId,
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
    },
  });
  revalidatePath(`/admin/quizzes/${q.quizId}`);
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin();
  const questionId = id.parse(formData.get("id"));
  const quizId = id.parse(formData.get("quizId"));
  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/admin/quizzes/${quizId}`);
}
