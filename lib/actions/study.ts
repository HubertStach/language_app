"use server";

import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/guards";
import { nextBox, nextDue } from "@/lib/leitner";

/** Record a Leitner review for a card and schedule its next due date. */
export async function reviewCard(cardId: string, knew: boolean) {
  const user = await requireUser();

  // Card must exist and be accessible: an official deck, or one the user owns.
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { deck: { select: { ownerId: true } } },
  });
  if (!card || (card.deck.ownerId !== null && card.deck.ownerId !== user.id)) {
    throw new Error("Card not found");
  }

  const existing = await prisma.progress.findUnique({
    where: { userId_cardId: { userId: user.id, cardId } },
    select: { box: true },
  });
  const box = nextBox(existing?.box ?? 1, knew);
  const dueAt = nextDue(box);

  await prisma.progress.upsert({
    where: { userId_cardId: { userId: user.id, cardId } },
    update: { box, dueAt },
    create: { userId: user.id, cardId, box, dueAt },
  });
}
