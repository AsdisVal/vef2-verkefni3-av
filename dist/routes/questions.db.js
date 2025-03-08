/**
 * Öll samskipti við gagnagrunn og gagnastöðlun fyrir Questions fara í gegnum aðskilin föll
 * sem categories.db.ts heldur utan um.
 *
 * Þessi uppsetning eykur endurnotkun og einfaldar prófanir.
 */
import sxss from "xss";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
const prisma = new PrismaClient();
/**
 * zod-schema
 * QuestionSchema kemur frá gagnagrunninum
 */
const QuestionSchema = z.object({
    id: z.number(),
    categoryId: z.number(),
    question: z.string().min(10, 'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024').max(1024, 'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024'),
});
const answerToCreateSchema = z.object({
    answer: z.string().min(1, 'Svar má ekki vera tómt')
        .max(512, 'Svar má ekki hafa meira en 512 stafi'),
    correct: z.boolean().default(false),
});
/**
 * zod-schema
 * QuestionToCreateSchema kemur frá notendum sem
 * býr til nýjan flokk í gagnagrunninn.
 */
const QuestionToCreateSchema = z.object({
    question: z.string()
        .min(10, 'Spurning verður að vera að minnsta kosti 10 stafir')
        .max(1024, 'Spurning má ekki vera lengri en 1024 stafir'),
    categoryId: z.number({
        required_error: 'categoryId er nauðsynleg',
        invalid_type_error: 'categoryId verður að vera tala',
    }),
    answers: z.array(answerToCreateSchema).min(1, 'Verður að vera amk eitt svar')
        .refine(answers => answers.some(answer => answer.correct), {
        message: 'Verður að vera amk eitt rétt svar'
    }),
});
/**
 * Schema for updating a question(both fields are optional)
 */
const QuestionUpdateSchema = z.object({
    question: z.string()
        .min(10, 'Spurning verður að vera að minnsta kosti 10 stafir, að hámarki 1024')
        .max(1024, 'Spurning er í mesta lagi 1024 stafir, og að minnsta kosti kosti 10 stafir')
        .optional(),
    categoryId: z.number().optional(),
});
export async function getQuestions() {
    const questions = await prisma.questions.findMany();
    console.log('questions :>> ', questions);
    return questions;
}
export function validateQuestion(data) {
    const valResult = QuestionToCreateSchema.safeParse(data);
    return valResult;
}
export async function createQuestion(data) {
    const sanatizedQuestion = sxss(data.question);
    const sanatizedAnswers = data.answers.map(answer => ({
        answer: sxss(answer.answer),
        correct: answer.correct
    }));
    const newQuestion = await prisma.questions.create({
        data: {
            question: sanatizedQuestion,
            categoryId: data.categoryId,
            answers: {
                create: sanatizedAnswers
            }
        },
        include: {
            answers: true
        }
    });
    return { question: newQuestion, created: true };
}
// get question by categoryId
export async function getQuestionsByCategoryId(categoryId) {
    const questions = await prisma.questions.findMany({
        where: { categoryId },
        include: { answers: true },
    });
    return questions;
}
export function validateQuestionUpdate(data) {
    return QuestionUpdateSchema.safeParse(data);
}
export async function updateQuestion(id, data) {
    // Build the update object, sanitizing the question if provided.
    const updateData = {};
    if (data.question !== undefined) {
        updateData.question = sxss(data.question);
    }
    if (data.categoryId !== undefined) {
        updateData.categoryId = data.categoryId;
    }
    if (Object.keys(updateData).length === 0) {
        throw new Error("No valid fields provided for update");
    }
    const updatedQuestion = await prisma.questions.update({
        where: { id },
        data: updateData,
        include: { answers: true }
    });
    return updatedQuestion;
}
/**
* Deletes a question by its id.
*/
export async function deleteQuestion(id) {
    await prisma.questions.delete({
        where: { id },
    });
}
