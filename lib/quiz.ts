// Generates a "random words" quiz: for each word, its translation is the
// correct answer among 3 random distinct wrong translations.
export type QuizWord = { text: string; translation: string };
export type Question = { prompt: string; options: string[]; correctIndex: number };

export const QUESTION_COUNT = 20;
const OPTION_COUNT = 4;

export function shuffle<T>(a: T[], rng: () => number = Math.random): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRandomQuiz(words: QuizWord[], rng: () => number = Math.random): Question[] {
  const allTranslations = [...new Set(words.map((w) => w.translation))];
  const chosen = shuffle([...words], rng).slice(0, QUESTION_COUNT);

  return chosen.map((w) => {
    const distractors = shuffle(
      allTranslations.filter((t) => t !== w.translation),
      rng,
    ).slice(0, OPTION_COUNT - 1);
    const options = shuffle([w.translation, ...distractors], rng);
    return { prompt: w.text, options, correctIndex: options.indexOf(w.translation) };
  });
}
