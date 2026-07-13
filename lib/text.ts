// A "; " in a translation separates multiple senses/words; we store and show
// them comma-separated instead. Applied at every write boundary (import,
// admin word create/edit) so the data is canonical everywhere.
export function normalizeSenses(s: string): string {
  return s.split(";").map((w) => w.trim()).filter(Boolean).join(", ");
}
