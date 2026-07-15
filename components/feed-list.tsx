"use client";

import { useState } from "react";
import { FeedCard } from "@/components/feed-card";

const PAGE_SIZE = 20;

type Item = {
  source: string;
  title: string;
  snippet: string;
  url: string;
  imageUrl?: string;
  dateLabel?: string | null;
};

/** Feed items paged client-side: 20 at a time, "Load more" reveals the next 20. */
export function FeedList({ items }: { items: Item[] }) {
  const [count, setCount] = useState(PAGE_SIZE);

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.slice(0, count).map((item) => (
          <li key={item.url + item.source}>
            <FeedCard {...item} />
          </li>
        ))}
      </ul>
      {count < items.length && (
        <button
          type="button"
          onClick={() => setCount((c) => c + PAGE_SIZE)}
          className="rounded-lg border border-gray-300 py-2 text-center text-sm font-medium"
        >
          Load more
        </button>
      )}
    </>
  );
}
