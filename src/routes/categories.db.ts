import { PrismaClient } from "@prisma/client";
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


export async function getCategoryDB(slug: string): Promise<Category | null> {
    return await prisma.categories.findUnique({ where: { slug } });
  }

export async function createCategory(title: string): Promise<{ category: Category, created: boolean }> {
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
  

/**
 * Uppfærir flokk með tiltekinni slug.
 * Uppfærir aðeins titilinn og endurgerir slug út frá nýja titlinum.
 * Skilar uppfærðum flokki eða null ef enginn flokk fannst.
 */
export async function updateCategory(slug: string, title: string): Promise<Category | null> {
    // Generate a new slug from the updated title.
    const newSlug = title.toLowerCase().trim().replace(/\s+/g, '-');
    try {
      const updatedCategory = await prisma.categories.update({
        where: { slug },
        data: { title, slug: newSlug }
      });
      return updatedCategory;
    } catch (error: any) {
      // Prisma throws error code 'P2025' if no record is found.
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }