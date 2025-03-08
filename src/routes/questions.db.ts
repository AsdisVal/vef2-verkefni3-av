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


type Question = z.infer<typeof QuestionSchema>;
type QuestionToCreate = z.infer<typeof QuestionToCreateSchema>;



export async function getQuestions(): Promise<Array<Question>> {
    const questions = await prisma.questions.findMany();
    console.log('questions :>> ', questions);
    return questions;
}
/**
 * 
 * @param {unknown} data
 */
export function validateQuestion(data: unknown) {
    const valResult = QuestionToCreateSchema.safeParse(data);
    return valResult;
}

/** 
 * @param {{ question: string; answers: any[]; categoryId: any; }} question
 * */ 
export async function createQuestion(question: QuestionToCreate): Promise<{ question: Question, created: boolean}> {
    const sanatizedQuestion = sxss(question.question);
    const sanatizedAnswers = question.answers.map(answer => ({
        answer: sxss(answer.answer),
        correct: answer.correct
    }));

    const newQuestion = await prisma.questions.create({
        data: {
            question: sanatizedQuestion,
            categoryId: question.categoryId,
            answers: {
                create: sanatizedAnswers
            }
        },
        include: {
            answers: true
        }
    });

    return { question: newQuestion, created: true};
} 

/**
 * @param {any} categoryId
 */
export async function getQuestionsByCategoryId(categoryId: number): Promise<Array<Question>> {
    const questions = await prisma.questions.findMany({
        where: { categoryId },
        include: { answers: true },
    });
    return questions;
}

/**
 * @param {unknown} data
 */
export function validateQuestionUpdate(data: unknown) {
    return QuestionUpdateSchema.safeParse(data);
  }


  /**
   * 
   * @param {number} id 
   * @param {Partial<{ question: string; categoryId: number }>} data 
   * @returns 
   */
export async function updateQuestion(
    id: number, 
    data: Partial<{ question: string; categoryId: number }>
  ): Promise<Question> {
    // Build the update object, sanitizing the question if provided.
    const updateData: Partial<{ question: string; categoryId: number }> = {};
    
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
 * @param {number} id - The id of the question to delete.
 */
export async function deleteQuestion(id: number): Promise<void> {
    await prisma.questions.delete({
      where: { id },
    });
  }