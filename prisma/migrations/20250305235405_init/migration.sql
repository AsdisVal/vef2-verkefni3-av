/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Answers` table. All the data in the column will be lost.
  - Added the required column `questionId` to the `Answers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Answers" DROP CONSTRAINT "Answers_categoryId_fkey";

-- AlterTable
ALTER TABLE "Answers" DROP COLUMN "categoryId",
ADD COLUMN     "questionId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
