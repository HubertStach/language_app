import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { WordForm } from "@/components/word-form";
import { updateWord } from "@/lib/actions/admin";

export default async function EditWordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { languageId } = await requireAdminLanguage();
  const { id } = await params;

  const [word, tags] = await Promise.all([
    prisma.word.findUnique({
      where: { id },
      include: { tags: { select: { id: true } } },
    }),
    prisma.tag.findMany({
      where: { languageId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!word || word.languageId !== languageId) notFound();

  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Edit word</h1>
      <WordForm
        action={updateWord}
        tags={tags}
        word={word}
        submitLabel="Save"
      />
      <Link href="/admin/words" className="text-sm underline">
        Back to words
      </Link>
    </main>
  );
}
