/*
  Warnings:

  - A unique constraint covering the columns `[userId,commitSha]` on the table `Solution` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Solution_commitSha_key";

-- CreateIndex
CREATE UNIQUE INDEX "Solution_userId_commitSha_key" ON "Solution"("userId", "commitSha");
