import Link from "next/link";
import { requireAdmin } from "@/lib/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin(); // 404s for non-admins

  return (
    <div className="mx-auto max-w-sm p-6">
      <nav className="mb-4 flex flex-wrap gap-3 text-sm font-medium">
        <Link href="/admin/words">Words</Link>
        <Link href="/admin/tags">Tags</Link>
        <Link href="/admin/decks">Decks</Link>
        <Link href="/admin/quizzes">Quizzes</Link>
        <Link href="/admin/feeds">Feeds</Link>
        <Link href="/" className="ml-auto text-gray-500">
          Exit
        </Link>
      </nav>
      {children}
    </div>
  );
}
