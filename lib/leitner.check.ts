// Run: npx tsx lib/leitner.check.ts
import assert from "node:assert";
import { nextBox, nextDue, MAX_BOX } from "./leitner";

assert.strictEqual(nextBox(1, true), 2, "right moves up");
assert.strictEqual(nextBox(MAX_BOX, true), MAX_BOX, "caps at max box");
assert.strictEqual(nextBox(4, false), 1, "wrong drops to box 1");

const from = new Date("2026-01-01T00:00:00Z");
assert.strictEqual(nextDue(1, from).getTime(), from.getTime(), "box 1 due now");
assert.strictEqual(
  nextDue(2, from).getTime(),
  from.getTime() + 86_400_000,
  "box 2 due in a day",
);

console.log("leitner ok");
