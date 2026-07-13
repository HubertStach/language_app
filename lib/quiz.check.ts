// Run: npx tsx lib/quiz.check.ts
import assert from "node:assert";
import { buildRandomQuiz, QUESTION_COUNT } from "./quiz";

const words = Array.from({ length: 30 }, (_, i) => ({
  text: `w${i}`,
  translation: `t${i}`,
}));

let seed = 1;
const rng = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

const q = buildRandomQuiz(words, rng);
assert.strictEqual(q.length, QUESTION_COUNT, "caps at QUESTION_COUNT");
for (const { prompt, options, correctIndex } of q) {
  assert.strictEqual(options.length, 4, "four options");
  assert.strictEqual(new Set(options).size, 4, "options are distinct");
  // correct option is this word's translation (prompt wN -> translation tN)
  assert.strictEqual(options[correctIndex], `t${prompt.slice(1)}`, "correct answer marked");
}

// Fewer words than options: no crash, no duplicate options.
const tiny = buildRandomQuiz(words.slice(0, 2), rng);
assert.strictEqual(new Set(tiny[0].options).size, tiny[0].options.length, "no dupes when scarce");

console.log("quiz ok");
