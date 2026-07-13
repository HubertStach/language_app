-- CreateTable
CREATE TABLE "feed_sources" (
    "id" TEXT NOT NULL,
    "languageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "feed_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_sources_languageId_url_key" ON "feed_sources"("languageId", "url");

-- AddForeignKey
ALTER TABLE "feed_sources" ADD CONSTRAINT "feed_sources_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
