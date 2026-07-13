"use client";

import { useActionState } from "react";
import { importWords, type ImportState } from "@/lib/actions/admin";

export function ImportWordsForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(
    importWords,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-2">
      <p className="text-sm text-gray-500">
        CSV columns: <code>content, language, meaning, tag</code>. Language
        matches a code or name (e.g. <code>es</code> or <code>Spanish</code>).
        Multiple tags separated by <code>;</code>. Missing tags are created.
      </p>
      <select
        name="kind"
        defaultValue="WORD"
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="WORD">Import as words</option>
        <option value="SENTENCE">Import as sentences</option>
      </select>
      <input
        type="file"
        name="file"
        accept=".csv,text/csv"
        required
        className="text-sm"
      />
      <button
        disabled={pending}
        className="rounded-lg border border-gray-300 py-2 font-medium disabled:opacity-50"
      >
        {pending ? "Importing…" : "Import CSV"}
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && (
        <div className="text-sm text-gray-600">
          <p>
            Imported {state.imported}, skipped {state.skipped} duplicate
            {state.skipped === 1 ? "" : "s"}.
          </p>
          {state.errors && state.errors.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-red-600">
              {state.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
