import Link from "next/link";

const SECTIONS = [
  ["Words", "/admin/words"],
  ["Tags", "/admin/tags"],
  ["Decks", "/admin/decks"],
  ["Quizzes", "/admin/quizzes"],
  ["Feeds", "/admin/feeds"],
] as const;

export default function AdminHome() {
  return (
    <main className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm text-gray-500">
        Managing content for your active language (change it in settings).
      </p>
      <ul className="flex flex-col gap-2">
        {SECTIONS.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-lg border border-gray-300 px-3 py-2 font-medium"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
