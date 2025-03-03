import { PrismaClient } from "@prisma/client";
import { title } from "process";
import { z } from "zod";

/**
 * CategorySchema kemur frá gagnagrunninum
 */
const CategorySchema = z.object({ // þetta er kóði sem þarf að geta keyrt
    id: z.number(),
    title: z.string().min(3, 'title must be at least 3 letters').max(1024, 'title must be at most 1024 letters'),
    slug: z.string()
});

/**
 * CategoryToCreateSchema kemur frá notendum sem 
 * býr til nýja færslu í gagnagrunninn.
 */
const CategoryToCreateSchema = z.object({
    title: z.string().min(3, 'title must be at least 3 letters').max(1024, 'title must be at most 1024 letters'),
});

type Category = z.infer<typeof CategorySchema>;

const mockCategories: Array<Category> = [
    {
        id: 1,
        slug: 'html',
        title: 'HTML'
    },
    {
        id: 2,
        slug: 'css',
        title: 'CSS'
    },
    {
        id: 3,
        slug: 'js',
        title: 'JavaSript'
    }
];

const prisma = new PrismaClient();

export async function getCategories(
limit: number = 10,
offset: number = 0
): Promise<Array<Category>> {
    const categories = await prisma.categories.findMany()
    console.log('categories :>> ', categories);
    return categories;
}

export function getCategory(slug: string): Category | null {
   const cat = mockCategories.find(c => 
    c.slug === slug)
    
    return cat ?? null;
}

/**
 * safeParse skilar discriminatedUnion: SAMMENGI af Success og Error.
 * ef SafeParseSuccess<Output> er með success: true, veit það að það er í því mengi.
 * Það sama gildir með SafeParseError<Input> með success: false, veit að það er í 
 * error menginu.
 * @param categoryToValidate: unknown 
 * @returns 
 */
export function validateCategory(categoryToValidate: unknown) {
    //notum zod með safeParse, sem tekur við gögnum sem er unknown
    const result = CategoryToCreateSchema.safeParse(categoryToValidate)

    //þurfum nú að pæla hverju viljum við skila en þurfum ekki að ákveða það 
    // hér og gerum þess vegna return result
    return result
    //tékkum svo í app.post(/categories) og tökum afstöðuna þar!!
}