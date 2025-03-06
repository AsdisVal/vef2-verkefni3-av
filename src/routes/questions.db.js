/**
 * Öll samskipti við gagnagrunn og gagnastöðlun fyrir Questions fara í gegnum aðskilin föll
 * sem categories.db.ts heldur utan um.
 *
 * Þessi uppsetning eykur endurnotkun og einfaldar prófanir.
 */
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
/**
 * zod-schema
 * QuestionSchema kemur frá gagnagrunninum
 */
const QuestionSchema = z.object({
  id: z.number(),
  categoryId: z.number(),
  question: z
    .string()
    .min(
      10,
      'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024'
    )
    .max(
      1024,
      'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024'
    ),
});
/**
 * zod-schema
 * QuestionToCreateSchema kemur frá notendum sem
 * býr til nýjan flokk í gagnagrunninn.
 */
const QuestionToCreateSchema = z.object({
  question: z
    .string()
    .min(
      10,
      'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024'
    )
    .max(
      1024,
      'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024'
    ),
});
const prisma = new PrismaClient();
export async function getQuestions() {
  const questions = await prisma.questions.findMany();
  console.log('questions :>> ', questions);
  return questions;
}
export async function validateQuestion(data) {
  if (
    !data.question ||
    typeof data.question !== 'string' ||
    data.question.length > 512
  ) {
    throw new Error('Invalid question: Must be a string up to 512 characters.');
  }
  // Check that categoryId is provided and is a number
  if (!data.categoryId || typeof data.categoryId !== 'number') {
    throw new Error('Invalid categoryId: must be a number.');
  }
  const validationResult = QuestionToCreateSchema.safeParse(questionToValidate);
  return validationResult;
}
export async function createQuestion(body) {
  // Generate a slug from the title (e.g., convert to lowercase and replace spaces with hyphens)
  const slug = title.toLowerCase().trim().replace(/\s+/g, '-');
  // Check if a category with this slug already exists in the database
  const existing = await prisma.categories.findUnique({ where: { slug } });
  if (existing) {
    // Return the existing category and a flag indicating no new creation
    return { category: existing, created: false };
  }
  // Otherwise, create a new category
  const newCategory = await prisma.categories.create({
    data: {
      title,
      slug,
    },
  });
  return { category: newCategory, created: true };
}
export async function getQuestion(question) {
  return await prisma.questions.findUnique({ where: { question } });
}
