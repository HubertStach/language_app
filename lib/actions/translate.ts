"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";

const inputSchema = z.object({
  title: z.string().max(500),
  snippet: z.string().max(2000),
});

/** Translate a feed item to English via DeepL (source language auto-detected). */
export async function translateFeedItem(input: {
  title: string;
  snippet: string;
}): Promise<{ title: string; snippet: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in." };

  const key = process.env.DEEPL_API_KEY;
  if (!key) return { error: "Translation is not configured." };

  const { title, snippet } = inputSchema.parse(input);

  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: [title, snippet], target_lang: "EN" }),
    // ponytail: no server-side cache — DeepL free tier (500k chars/month) is
    // plenty for personal use; cache by item URL if quota ever runs out.
  });
  if (!res.ok) return { error: "Translation failed." };

  const data: { translations: { text: string }[] } = await res.json();
  return {
    title: data.translations[0]?.text ?? title,
    snippet: data.translations[1]?.text ?? snippet,
  };
}
