// ponytail: hardcoded topic list — move to DB only if topics become admin-managed.
export const WIKI_TOPICS = [
  { slug: "pronouns", title: "Pronouns" },
  { slug: "adverbs", title: "Adverbs" },
  { slug: "prepositions", title: "Prepositions" },
  { slug: "days-of-the-week", title: "Days of the week" },
  { slug: "months", title: "Months" },
  { slug: "seasons", title: "Seasons" },
  { slug: "numbers", title: "Numbers" },
  { slug: "time-words", title: "Time words" },
] as const;
