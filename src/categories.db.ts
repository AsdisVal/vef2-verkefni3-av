type Category = {
    id: number;
    slug: string;
    title: string;
}
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