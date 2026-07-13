"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Flashcard } from "@/components/flashcard";
import { reviewCard } from "@/lib/actions/study";

type Card = { id: string; front: string; back: string };

/**
 * Flip-card session with know/don't-know scoring. `persist` records Leitner
 * progress (deck study); off for throwaway random sets.
 */
export function StudySession({
  cards,
  persist = false,
}: {
  cards: Card[];
  persist?: boolean;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [known, setKnown] = useState(0);
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return <p className="text-gray-500">No cards here yet.</p>;
  }

  if (i >= cards.length) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-lg font-medium">
          Done — you knew {known} / {cards.length} 🎉
        </p>
        <button
          type="button"
          onClick={() => {
            setI(0);
            setKnown(0);
            router.refresh(); // re-fetch: due order (persist) or a fresh random set
          }}
          className="rounded-lg bg-black py-3 font-medium text-white"
        >
          {persist ? "Study again" : "Shuffle again"}
        </button>
      </div>
    );
  }

  const card = cards[i];

  function rate(knew: boolean) {
    startTransition(async () => {
      if (persist) await reviewCard(card.id, knew);
      if (knew) setKnown((n) => n + 1);
      setI((n) => n + 1);
    });
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="font-medium text-green-600">✓ {known}</span>
        <span>
          {i + 1} / {cards.length}
        </span>
      </div>
      {/* key remounts the card so it resets to the word side (unflipped). */}
      <Flashcard key={card.id} front={card.front} back={card.back} />
      <div className="flex gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => rate(false)}
          className="flex-1 rounded-lg border border-red-300 bg-red-50 py-3 font-medium text-red-700 disabled:opacity-50"
        >
          Don&apos;t know
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => rate(true)}
          className="flex-1 rounded-lg border border-green-300 bg-green-50 py-3 font-medium text-green-700 disabled:opacity-50"
        >
          Know
        </button>
      </div>
    </div>
  );
}
