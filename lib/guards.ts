import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** Authenticated user or redirect to login. Use in every page/action. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
}

/** Admin user or 404 (don't reveal the route exists). */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") notFound();
  return user;
}

/**
 * User + their active language id, read fresh from the DB (the JWT copy can be
 * stale right after a change in settings). Redirects to settings if unset.
 */
export async function requireActiveLanguage() {
  const user = await requireUser();
  return { user, languageId: await activeLanguageId(user.id) };
}

/** Admin + their active language (the language they're authoring content for). */
export async function requireAdminLanguage() {
  const user = await requireAdmin();
  return { user, languageId: await activeLanguageId(user.id) };
}

async function activeLanguageId(userId: string) {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeLanguageId: true },
  });
  if (!row?.activeLanguageId) redirect("/settings");
  return row.activeLanguageId;
}
