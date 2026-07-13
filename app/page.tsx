import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeLanguage: { select: { name: true } } },
  });
  const isAdmin = session.user.role === "ADMIN";

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <p className="text-gray-600">
        {user?.activeLanguage
          ? `You're learning ${user.activeLanguage.name}.`
          : "Pick a language in Profile to get started."}
      </p>

      <Link
        href="/decks"
        className="rounded-lg bg-black py-3 text-center font-medium text-white"
      >
        Study flashcards
      </Link>

      <Link
        href="/random"
        className="rounded-lg border border-gray-300 py-3 text-center font-medium"
      >
        Random flashcards
      </Link>

      {isAdmin && (
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 py-2 text-center font-medium"
        >
          Admin
        </Link>
      )}
    </main>
  );
}
