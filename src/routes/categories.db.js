/**
 * Öll samskipti við gagnagrunn og gagnastöðlun fyrir Categories fara í gegnum aðskilin föll
 * sem categories.db.ts heldur utan um.
 *
 * Þessi uppsetning eykur endurnotkun og einfaldar prófanir.
 */
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import sxss from "xss";
/**
 * zod-schema
 * CategorySchema kemur frá gagnagrunninum
 */
const CategorySchema = z.object({
    id: z.number(),
    title: z.string().min(3, 'title must be at least 3 letters').max(128, 'title must be at most 128 letters'),
    slug: z.string().min(1, 'slug must be at least 1 letter').max(128, 'slug must be at most 128 letters'),
});
/**
 * zod-schema
 * CategoryToCreateSchema kemur frá notendum sem
 * býr til nýjan flokk í gagnagrunninn.
 */
const CategoryToCreateSchema = z.object({
    title: z.string().min(3, 'title must be at least 3 letters').max(128, 'title must be at most 128 letters'),
});
/*
prisma mun sjá um að tengjast gagnagrunni með DATABASE_URL
strengnum
 */
const prisma = new PrismaClient();
const categoryCriteria = (slug) => ({ slug });
/**
 * Nær í flokkana úr gagnasafninu
 * (Vitnanir: GET/ categories)
 */
export async function getCategories() {
    const categories = await prisma.categories.findMany();
    console.log('categories :>> ', categories);
    return categories;
}
/**
 * safeParse skilar discriminatedUnion: SAMMENGI af Success og Error.
 * ef SafeParseSuccess<Output> er með success: true, veit það að það er í því mengi.
 * Það sama gildir með SafeParseError<Input> með success: false, veit að það er í
 * error menginu.
 * @param categoryToValidate: unknown
 * @returns validationResult
 */
export function validateCategory(categoryToValidate) {
    //notum zod með safeParse, sem tekur við gögnum sem er unknown
    const validationResult = CategoryToCreateSchema.safeParse(categoryToValidate);
    //þurfum nú að pæla hverju viljum við skila en þurfum ekki að ákveða 
    return validationResult;
    //tékkum svo í app.post(/categories) og tökum afstöðuna þar!!
}
/**
 * Finnur flokk með slug
 * @param slug fyrir category
 * @returns nafni fyrir category
 */
export async function getCategory(slug) {
    return await prisma.categories.findUnique({ where: categoryCriteria(slug) });
}
export async function createCategory(title) {
    // Generate a slug from the title (e.g., convert to lowercase and replace spaces with hyphens)
    title = sxss(title);
    const slug = title.toLowerCase().trim().replace(/\s+/g, '-');
    // Check if a category with this slug already exists in the database
    const existing = await prisma.categories.findUnique({ where: categoryCriteria(slug) });
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
 * Uppfærir flokk með .update frá prisma
 * Uppfærir aðeins titilinn og endurgerir slug út frá nýja titlinum.
 * Skilar uppfærðum flokki eða null ef enginn flokk fannst.
 */
export async function updateCategory(slug, title) {
    // Generate a new slug from the updated title.
    title = sxss(title);
    const newSlug = title.toLowerCase().trim().replace(/\s+/g, '-');
    try {
        const updatedCategory = await prisma.categories.update({
            where: categoryCriteria(slug),
            data: { title, slug: newSlug }
        });
        return updatedCategory;
    }
    catch (error) {
        console.error('Error updating category:', error);
        return null;
    }
}
export async function deleteCategory(slug) {
    try {
        await prisma.categories.delete({
            where: categoryCriteria(slug)
        });
        return true;
    }
    catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
}
