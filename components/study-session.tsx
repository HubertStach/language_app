"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flashcard } from "@/components/flashcard";
import { reviewCard } from "@/lib/actions/study";

type Card = { id: string; front: string; back: string };

export function StudySession({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return <p className="text-gray-500">This deck has no cards yet.</p>;
  }

  if (i >= cards.length) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-lg font-medium">
          Done — {cards.length} card{cards.length === 1 ? "" : "s"} reviewed 🎉
        </p>
        <button
          type="button"
          onClick={() => {
            setI(0);
            router.refresh(); // re-fetch with updated due order
          }}
          className="rounded-lg bg-black py-3 font-medium text-white"
        >
          Study again
        </button>
      </div>
    );
  }

  const card = cards[i];

  function rate(knew: boolean) {
    startTransition(async () => {
      await reviewCard(card.id, knew);
      setI((n) => n + 1);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-center text-sm text-gray-500">
        {i + 1} / {cards.length}
      </p>
      {/* key remounts the card so its starting side re-randomises. */}
      <Flashcard key={card.id} front={card.front} back={card.back} />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => rate(false)}
          className="flex-1 rounded-lg border border-red-300 bg-red-50 py-3 font-medium text-red-700 disabled:opacity-50"
        >
          Didn&apos;t know
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => rate(true)}
          className="flex-1 rounded-lg border border-green-300 bg-green-50 py-3 font-medium text-green-700 disabled:opacity-50"
        >
          Knew it
        </button>
      </div>
    </div>
  );
}
