"use client";

import { useState } from "react";
import { Flashcard } from "@/components/flashcard";

type Card = { id: string; front: string; back: string };

export function StudySession({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);

  if (cards.length === 0) {
    return <p className="text-gray-500">This deck has no cards yet.</p>;
  }

  const card = cards[i];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-gray-500">
        {i + 1} / {cards.length}
      </p>
      {/* key remounts the card so its starting side re-randomises. */}
      <Flashcard key={card.id} front={card.front} back={card.back} />
      <button
        type="button"
        onClick={() => setI((n) => (n + 1) % cards.length)}
        className="rounded-lg bg-black py-3 font-medium text-white"
      >
        Next card
      </button>
    </div>
  );
}
