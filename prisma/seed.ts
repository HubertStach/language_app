import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const LANGUAGES = [
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
];

// Known-good RSS 2.0 feeds per language code (verified 2026-07).
const FEEDS: Record<string, { name: string; url: string }[]> = {
  es: [
    { name: "El País", url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada" },
    { name: "20minutos", url: "https://www.20minutos.es/rss/" },
  ],
  fr: [{ name: "Le Monde", url: "https://www.lemonde.fr/rss/une.xml" }],
  de: [{ name: "Tagesschau", url: "https://www.tagesschau.de/xml/rss2/" }],
  it: [{ name: "ANSA", url: "https://www.ansa.it/sito/ansait_rss.xml" }],
};

async function main() {
  for (const lang of LANGUAGES) {
    const { id } = await prisma.language.upsert({
      where: { code: lang.code },
      update: { name: lang.name },
      create: lang,
    });
    for (const feed of FEEDS[lang.code] ?? []) {
      await prisma.feedSource.upsert({
        where: { languageId_url: { languageId: id, url: feed.url } },
        update: { name: feed.name },
        create: { languageId: id, ...feed },
      });
    }
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin1234";
  await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN" },
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  console.log(`Seeded ${LANGUAGES.length} languages and admin user (${email}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
