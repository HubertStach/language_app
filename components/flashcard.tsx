"use client";

import { useState } from "react";

/**
 * A tappable flashcard. Shows the word (front) first; tapping flips to the
 * translation (back).
 */
// "; " separates multiple words/senses in the data; show them as ", ".
const format = (s: string) =>
  s.split(";").map((w) => w.trim()).filter(Boolean).join(", ");

export function Flashcard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  const showingBack = flipped;

  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-pressed={flipped}
      className="flex min-h-56 w-full min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm transition active:scale-[0.99]"
    >
      <span className="w-full break-words text-3xl font-bold text-indigo-950">
        {format(showingBack ? back : front)}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-indigo-400">
        tap to flip
      </span>
    </button>
  );
}
