import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Google is optional locally — only enable it when creds are configured.
const providers = [
  Credentials({
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      });
      if (!user?.passwordHash) return null;

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
  ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // required for the Credentials provider
  trustHost: true,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    // Carry role + activeLanguageId on the token so pages/actions can gate without a DB hit.
    async jwt({ token, user }) {
      if (user?.id) {
        const db = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, activeLanguageId: true },
        });
        token.role = db?.role ?? "USER";
        token.activeLanguageId = db?.activeLanguageId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.activeLanguageId = token.activeLanguageId;
      }
      return session;
    },
  },
});
