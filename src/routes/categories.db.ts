import { z } from "zod";

const CategorySchema = z.object({ // þetta er kóði sem þarf að geta keyrt
    id: z.number(),
    title: z.string().min(3, 'title must be at least 3 letters').max(1024, 'title must be at most 1024 letters'),
    slug: z.string()
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
]

export function getCategories(limit: number = 10,  offset: number = 0): Array<Category> {
    
    console.log(limit);
    return mockCategories;
}

export function getCategory(slug: string): Category | null {

   const cat = mockCategories.find(c => 
    c.slug === slug)
    
    return cat ?? null;
}