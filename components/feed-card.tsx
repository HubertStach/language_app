"use client";

import { useState } from "react";

type Props = {
  source: string;
  title: string;
  snippet: string;
  url: string;
  imageUrl?: string;
  dateLabel?: string | null;
};

/** Feed post: tap to expand the full text, with a link out to the source. */
export function FeedCard({ source, title, snippet, url, imageUrl, dateLabel }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-gray-200 p-4">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex min-w-0 flex-col gap-2 text-left"
      >
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <span className="font-medium uppercase tracking-wide">{source}</span>
          {dateLabel && <span>{dateLabel}</span>}
        </div>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- remote hosts vary; next/image needs a domain allowlist
          <img
            src={imageUrl}
            alt=""
            className="max-h-48 w-full rounded-lg object-cover"
            loading="lazy"
          />
        )}
        <h2 className="font-semibold leading-snug">{title}</h2>
        {snippet && (
          <p
            className={`break-words text-sm leading-relaxed text-gray-600 ${
              expanded ? "" : "line-clamp-4"
            }`}
          >
            {snippet}
          </p>
        )}
      </button>

      {expanded && (
        <a
          href={url}
          target="_blank"
          rel="noopener"
          className="mt-1 rounded-lg bg-black py-2 text-center text-sm font-medium text-white"
        >
          Read at {source} ↗
        </a>
      )}
    </article>
  );
}
