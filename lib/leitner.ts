// Leitner spaced repetition. Boxes 1..5; getting a card right moves it up a
// box (longer interval), getting it wrong drops it back to box 1.
export const MAX_BOX = 5;
const INTERVAL_DAYS = [0, 1, 3, 7, 14]; // index = box - 1

export function nextBox(box: number, knew: boolean): number {
  return knew ? Math.min(box + 1, MAX_BOX) : 1;
}

export function nextDue(box: number, from = new Date()): Date {
  const days = INTERVAL_DAYS[box - 1] ?? 0;
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}
