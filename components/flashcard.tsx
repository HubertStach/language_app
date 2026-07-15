"use client";

import { useRef, useState } from "react";
import { normalizeSenses } from "@/lib/text";

const SWIPE_THRESHOLD = 120;

/**
 * A tappable flashcard. Shows the word (front) first; tapping flips to the
 * translation (back). It also supports swiping right/left to rate the card.
 */
export function Flashcard({
  front,
  back,
  onSwipe,
  disabled = false,
}: {
  front: string;
  back: string;
  onSwipe?: (decision: boolean) => void;
  disabled?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeCommittedRef = useRef(false);
  const showingBack = flipped;

  function resetGesture() {
    setIsDragging(false);
    swipeCommittedRef.current = false;
    pointerStartRef.current = null;
  }

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
    swipeCommittedRef.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!isDragging || !pointerStartRef.current || disabled) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      swipeCommittedRef.current = true;
      setDragX(deltaX);
    }
  }

  function finishGesture(event: React.PointerEvent<HTMLButtonElement>) {
    if (!pointerStartRef.current || disabled) return;

    const deltaX = event.clientX - pointerStartRef.current.x;

    if (swipeCommittedRef.current && Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      const decision = deltaX > 0;
      setDragX(decision ? 420 : -420);
      window.setTimeout(() => onSwipe?.(decision), 120);
    } else {
      setDragX(0);
    }

    resetGesture();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function handleClick() {
    if (disabled || swipeCommittedRef.current) return;
    setFlipped((f) => !f);
  }

  // Green/red tint that deepens as the drag approaches the swipe threshold.
  const tintAlpha = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1) * 0.25;
  const tint = `rgba(${dragX > 0 ? "34,197,94" : "239,68,68"},${tintAlpha})`;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        aria-pressed={flipped}
        className="flex min-h-56 w-full min-w-0 flex-col items-center justify-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center shadow-sm transition active:scale-[0.99]"
        style={{
          transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
          backgroundImage: dragX ? `linear-gradient(${tint},${tint})` : undefined,
          touchAction: "none",
          transition: isDragging ? "none" : "transform 180ms ease, box-shadow 180ms ease",
        }}
      >
        <span className="w-full break-words text-3xl font-bold text-indigo-950">
          {normalizeSenses(showingBack ? back : front)}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-400">
          tap to flip • swipe right to know
        </span>
      </button>
    </div>
  );
}
