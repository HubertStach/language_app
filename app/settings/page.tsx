import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { setActiveLanguage, logout } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const session = await auth();
  // proxy redirects unauthenticated users; this guards direct/POST access.
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [languages, user] = await Promise.all([
    prisma.language.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeLanguageId: true, email: true },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        {user?.email && <p className="text-sm text-gray-500">{user.email}</p>}
      </div>

      <form action={setActiveLanguage} className="flex flex-col gap-3">
        <label className="text-sm font-medium" htmlFor="languageId">
          Language you&apos;re learning
        </label>
        <select
          id="languageId"
          name="languageId"
          defaultValue={user?.activeLanguageId ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="" disabled>
            Pick a language…
          </option>
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg bg-black py-2 font-medium text-white"
        >
          Save
        </button>
      </form>

      <form action={logout}>
        <button
          type="submit"
          className="w-full rounded-lg border border-gray-300 py-2 text-center text-sm text-gray-500"
        >
          Log out
        </button>
      </form>
    </main>
  );
}
