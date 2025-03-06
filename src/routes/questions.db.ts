/**
 * Öll samskipti við gagnagrunn og gagnastöðlun fyrir Questions fara í gegnum aðskilin föll
 * sem categories.db.ts heldur utan um. 
 * 
 * Þessi uppsetning eykur endurnotkun og einfaldar prófanir.
 */

import { PrismaClient } from "@prisma/client";
import { z } from "zod";


/**
 * zod-schema
 * QuestionSchema kemur frá gagnagrunninum
 */
const QuestionSchema = z.object({ // þetta er kóði sem þarf að geta keyrt
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



/** TYPE DEFINITIONS */
type Question = z.infer<typeof QuestionSchema>;
type QuestionToCreate = z.infer<typeof QuestionToCreateSchema>;

const prisma = new PrismaClient();

export async function getQuestions(): Promise<Array<Question>> {
    const questions = await prisma.questions.findMany();
    console.log('questions :>> ', questions);
    return questions;
}

export function validateQuestion(data: unknown) {
    const valResult = QuestionToCreateSchema.safeParse(data);
    return valResult;
}

export async function createQuestion(data: QuestionToCreate): Promise<{ question: Question, created: boolean}> {
    
    const newQuestion = await prisma.questions.create({
        data: {
            question: data.question,
            categoryId: data.categoryId,
            answers: {
                create: data.answers.map(answer => ({
                    answer: answer.answer,
                    correct: answer.correct
                }))
            }
        },
        include: {
            answers: true
        }
    });

    return { question: newQuestion, created: true};
} 


