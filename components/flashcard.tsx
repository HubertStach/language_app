"use client";

import { useEffect, useState } from "react";

/**
 * A tappable flashcard. Which face shows first is randomised per card so you
 * can't predict whether you'll see the word or its meaning; tapping flips it.
 */
export function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  const [startBack, setStartBack] = useState(false);

  // Randomise the starting side after mount to avoid an SSR hydration mismatch.
  useEffect(() => {
    setStartBack(Math.random() < 0.5);
  }, []);

  const showingBack = startBack !== flipped; // XOR

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className="flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm transition active:scale-[0.99]"
    >
      <span className="text-3xl font-bold text-indigo-950">
        {showingBack ? back : front}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-indigo-400">
        tap to flip
      </span>
    </button>
  );
}
