// Run: npx tsx lib/text.check.ts
import assert from "node:assert";
import { normalizeSenses } from "./text";

assert.strictEqual(normalizeSenses("dog; hound"), "dog, hound");
assert.strictEqual(normalizeSenses("a;b;c"), "a, b, c", "no-space semicolons");
assert.strictEqual(normalizeSenses("run; ; jump;"), "run, jump", "drops empties");
assert.strictEqual(normalizeSenses("single"), "single", "unchanged without ;");

console.log("text ok");
