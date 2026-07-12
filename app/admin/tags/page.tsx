import { prisma } from "@/lib/db";
import { requireAdminLanguage } from "@/lib/guards";
import { createTag, deleteTag } from "@/lib/actions/admin";

export default async function AdminTagsPage() {
  const { languageId } = await requireAdminLanguage();
  const tags = await prisma.tag.findMany({
    where: { languageId },
    orderBy: { name: "asc" },
    include: { _count: { select: { words: true } } },
  });

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold">Tags</h1>
        <form action={createTag} className="flex gap-2">
          <input
            name="name"
            required
            placeholder="New tag"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
          <button className="rounded-lg bg-black px-4 font-medium text-white">
            Add
          </button>
        </form>
      </section>

      <ul className="flex flex-col gap-2">
        {tags.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-2 rounded-lg border border-gray-200 p-3"
          >
            <span className="flex-1">{t.name}</span>
            <span className="text-sm text-gray-400">{t._count.words}</span>
            <form action={deleteTag}>
              <input type="hidden" name="id" value={t.id} />
              <button className="text-sm text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {tags.length === 0 && <li className="text-gray-500">No tags yet.</li>}
      </ul>
    </main>
  );
}
