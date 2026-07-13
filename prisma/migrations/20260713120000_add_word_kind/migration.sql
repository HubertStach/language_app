-- CreateEnum
CREATE TYPE "WordKind" AS ENUM ('WORD', 'SENTENCE');

-- AlterTable
ALTER TABLE "words" ADD COLUMN "kind" "WordKind" NOT NULL DEFAULT 'WORD';
