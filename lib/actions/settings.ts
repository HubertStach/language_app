"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth, signOut } from "@/lib/auth";

export async function setActiveLanguage(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const languageId = z.string().min(1).parse(formData.get("languageId"));

  // FK guarantees the language exists; a bad id throws and the update is rejected.
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeLanguageId: languageId },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
