import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logout } from "@/lib/actions/settings";

export default async function Home() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, activeLanguage: { select: { name: true } } },
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">
        Hi{user?.name ? `, ${user.name}` : ""} 👋
      </h1>

      <p className="text-gray-600">
        {user?.activeLanguage
          ? `You're learning ${user.activeLanguage.name}.`
          : "You haven't picked a language yet."}
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/settings"
          className="rounded-lg border border-gray-300 py-2 text-center font-medium"
        >
          {user?.activeLanguage ? "Change language" : "Pick a language"}
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="w-full rounded-lg py-2 text-center text-sm text-gray-500 underline"
          >
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
