/*
  Warnings:

  - You are about to drop the column `lastUsed` on the `Session` table. All the data in the column will be lost.
  - Added the required column `lastUsedAt` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Made the column `refreshTokenHash` on table `Session` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Session_userId_refreshTokenHash_expiresAt_idx";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "lastUsed",
ADD COLUMN     "lastUsedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "refreshTokenHash" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
