"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Question } from "@/lib/quiz";

export function QuizPlayer({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  if (questions.length === 0) {
    return (
      <p className="text-gray-500">
        Not enough words in this language yet to build a quiz.
      </p>
    );
  }

  if (i >= questions.length) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-lg font-medium">
          You scored {score} / {questions.length} 🎉
        </p>
        <button
          type="button"
          onClick={() => {
            setI(0);
            setScore(0);
            setPicked(null);
            router.refresh(); // fresh random quiz
          }}
          className="rounded-lg bg-black py-3 font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  const q = questions[i];
  const answered = picked !== null;

  function choose(index: number) {
    if (answered) return;
    setPicked(index);
    if (index === q.correctIndex) setScore((s) => s + 1);
  }

  function next() {
    setPicked(null);
    setI((n) => n + 1);
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="font-medium text-green-600">✓ {score}</span>
        <span>
          {i + 1} / {questions.length}
        </span>
      </div>

      <div className="flex min-h-40 w-full min-w-0 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 p-6 text-center">
        <span className="w-full break-words text-3xl font-bold text-indigo-950">
          {q.prompt}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {q.options.map((opt, idx) => {
          let cls = "border-gray-300";
          if (answered) {
            if (idx === q.correctIndex) cls = "border-green-400 bg-green-50 text-green-700";
            else if (idx === picked) cls = "border-red-400 bg-red-50 text-red-700";
            else cls = "border-gray-200 text-gray-400";
          }
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => choose(idx)}
              className={`w-full break-words rounded-lg border py-3 font-medium ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {answered && (
        <button
          type="button"
          onClick={next}
          className="rounded-lg bg-black py-3 font-medium text-white"
        >
          {i + 1 === questions.length ? "See score" : "Next"}
        </button>
      )}
    </div>
  );
}
