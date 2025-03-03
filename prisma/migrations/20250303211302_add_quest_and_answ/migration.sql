-- AlterTable
ALTER TABLE "Categories" ALTER COLUMN "title" SET DATA TYPE VARCHAR;

-- CreateTable
CREATE TABLE "Questions" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "question" VARCHAR(512) NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answers" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "answer" VARCHAR(512) NOT NULL,
    "correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Questions" ADD CONSTRAINT "Questions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answers" ADD CONSTRAINT "Answers_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
