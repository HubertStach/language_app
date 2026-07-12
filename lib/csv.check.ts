// Run: npx tsx lib/csv.check.ts
import assert from "node:assert";
import { parseCsv } from "./csv";

// basic rows
assert.deepStrictEqual(parseCsv("a,b\n1,2"), [
  ["a", "b"],
  ["1", "2"],
]);

// quoted field with comma + newline + escaped quote
assert.deepStrictEqual(
  parseCsv('content,meaning\n"hola, mundo","say ""hi"""\nadios,bye'),
  [
    ["content", "meaning"],
    ["hola, mundo", 'say "hi"'],
    ["adios", "bye"],
  ],
);

// trailing newline shouldn't add an empty row
assert.deepStrictEqual(parseCsv("a\n1\n"), [["a"], ["1"]]);

console.log("csv ok");
