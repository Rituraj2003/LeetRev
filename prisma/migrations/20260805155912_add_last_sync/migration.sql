/*
  Warnings:

  - You are about to drop the column `problemId` on the `Review` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[solutionId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `solutionId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Solution` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_problemId_fkey";

-- DropIndex
DROP INDEX "Review_problemId_key";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "problemId",
ADD COLUMN     "solutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Solution" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lastSyncAt" TIMESTAMP(3),
    "githubId" TEXT NOT NULL,
    "githubUsername" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubUsername_key" ON "User"("githubUsername");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Review_solutionId_key" ON "Review"("solutionId");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
