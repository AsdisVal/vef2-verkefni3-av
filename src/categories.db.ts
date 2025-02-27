type Category = {
    id: number;
    slug: string;
    title: string;
}
export function getCategories(limit: number = 10,  offset: number = 0): Array<Category> {
    const mockCategories = [
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
    console.log(limit);
    return mockCategories;
}