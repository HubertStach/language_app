"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";

export async function setActiveLanguage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const languageId = z.string().min(1).parse(formData.get("languageId"));

  // updateMany doesn't throw when no row matches. If the session's user is gone
  // (e.g. a dev DB reset left a stale cookie), the session outlived its user —
  // sign out so they re-authenticate instead of hitting a 500.
  const { count } = await prisma.user.updateMany({
    where: { id: session.user.id },
    data: { activeLanguageId: languageId },
  });
  if (count === 0) {
    await signOut({ redirectTo: "/login" });
    return;
  }

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
