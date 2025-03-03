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
 * býr til nýjan flokk í gagnagrunninn.
 */
const CategoryToCreateSchema = z.object({
    title: z.string().min(3, 'title must be at least 3 letters').max(1024, 'title must be at most 1024 letters'),
});

type Category = z.infer<typeof CategorySchema>;

const mockCategories: Array<Category> = [
    {
        id: 1,
        title: 'HTML',
        slug: 'html'
    },
    {
        id: 2,
        title: 'CSS',
        slug: 'css'
    },
    {
        id: 3,
        title: 'JavaSript',
        slug: 'js'
    }
];

const prisma = new PrismaClient();

/**
 * Nær í flokkana úr gagnasafninu
 * (Vitnanir: GET/ categories)
 */
export async function getCategories(): Promise<Array<Category>> {
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
    //þurfum nú að pæla hverju viljum við skila en þurfum ekki að ákveða 
    return result
    //tékkum svo í app.post(/categories) og tökum afstöðuna þar!!
}

