"use client";

import { useState, useTransition } from "react";
import { translateFeedItem } from "@/lib/actions/translate";

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
  const [showEnglish, setShowEnglish] = useState(false);
  const [english, setEnglish] = useState<{ title: string; snippet: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleTranslation() {
    setError(null);
    if (english) {
      setShowEnglish((s) => !s); // already fetched — just flip
      return;
    }
    startTransition(async () => {
      const result = await translateFeedItem({ title, snippet });
      if ("error" in result) setError(result.error);
      else {
        setEnglish(result);
        setShowEnglish(true);
      }
    });
  }

  const shownTitle = showEnglish && english ? english.title : title;
  const shownSnippet = showEnglish && english ? english.snippet : snippet;

  return (
    <article className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 p-4">
      <button
        type="button"
        onClick={toggleTranslation}
        disabled={pending}
        aria-label={showEnglish ? "Show original" : "Translate to English"}
        className={`absolute right-3 top-3 ${
          showEnglish ? "text-blue-600" : "text-gray-400"
        } ${pending ? "animate-pulse" : ""}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
          <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="flex min-w-0 flex-col gap-2 text-left"
      >
        <div className="flex items-center justify-between gap-2 pr-8 text-xs text-gray-400">
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
        <h2 className="font-semibold leading-snug">{shownTitle}</h2>
        {shownSnippet && (
          <p
            className={`break-words text-sm leading-relaxed text-gray-600 ${
              expanded ? "" : "line-clamp-4"
            }`}
          >
            {shownSnippet}
          </p>
        )}
      </button>

      {error && <p className="text-center text-xs text-red-600">{error}</p>}

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
