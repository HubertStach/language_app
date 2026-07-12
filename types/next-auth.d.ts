import type { Role } from "@/app/generated/prisma/enums";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      activeLanguageId: string | null;
    } & DefaultSession["user"];
  }
}

// JWT lives in @auth/core/jwt; next-auth/jwt only re-exports it, so augment the source.
declare module "@auth/core/jwt" {
  interface JWT {
    role: Role;
    activeLanguageId: string | null;
  }
}
