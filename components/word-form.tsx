import { WordType, WordKind } from "@/app/generated/prisma/enums";

const WORD_TYPES = Object.values(WordType);

type Props = {
  action: (formData: FormData) => void;
  tags: { id: string; name: string }[];
  submitLabel: string;
  word?: {
    id: string;
    text: string;
    translation: string;
    wordType: WordType;
    kind: WordKind;
    tags: { id: string }[];
  };
};

export function WordForm({ action, tags, submitLabel, word }: Props) {
  const selected = new Set(word?.tags.map((t) => t.id));

  return (
    <form action={action} className="flex flex-col gap-2">
      {word && <input type="hidden" name="id" value={word.id} />}
      <input
        name="text"
        defaultValue={word?.text}
        required
        placeholder="Word"
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
      <input
        name="translation"
        defaultValue={word?.translation}
        required
        placeholder="Translation"
        className="rounded-lg border border-gray-300 px-3 py-2"
      />
      <div className="flex gap-2">
        <select
          name="kind"
          defaultValue={word?.kind ?? "WORD"}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="WORD">word</option>
          <option value="SENTENCE">sentence</option>
        </select>
        <select
          name="wordType"
          defaultValue={word?.wordType ?? "OTHER"}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
        >
          {WORD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      {tags.length > 0 && (
        <fieldset className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-2">
          {tags.map((t) => (
            <label key={t.id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                name="tagIds"
                value={t.id}
                defaultChecked={selected.has(t.id)}
              />
              {t.name}
            </label>
          ))}
        </fieldset>
      )}
      <button className="rounded-lg bg-black py-2 font-medium text-white">
        {submitLabel}
      </button>
    </form>
  );
}
