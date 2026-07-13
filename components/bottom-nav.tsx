"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Learn", icon: "📚" },
  { href: "/words", label: "Words", icon: "🔤" },
  { href: "/quizzes", label: "Quizzes", icon: "❓" },
  { href: "/settings", label: "Profile", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-white">
      <ul className="mx-auto flex max-w-sm">
        {tabs.map(({ href, label, icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
                  active ? "text-indigo-600" : "text-gray-500"
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
