import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { getCategories, getCategory, validateCategory, createCategory, updateCategory, deleteCategory } from './routes/categories.db.js';
import { getQuestions, validateQuestion, createQuestion, updateQuestion } from './routes/questions.db.js';
const app = new Hono();
/**
 * Þetta er Heimasíðan
 */
app.use(prettyJSON()); // With options: prettyJSON({ space: 4 })
app.get('/', (c) => {
    const data = {
        hello: 'hono'
    };
    return c.json(data);
});
/**
 * READ: skilar lista af flokkum
 */
app.get('/categories', async (c) => {
    try {
        const categories = await getCategories();
        return c.json(categories);
    }
    catch (error) {
        console.log('Error fetching categories:', error);
        return c.json({ message: 'Internal Error' }, 500);
    }
});
/**
 * READ:skilar stökum flokki
 */
app.get('/categories/:slug', async (c) => {
    const slugParam = c.req.param('slug');
    try {
        const category = await getCategory(slugParam);
        if (!category) {
            return c.json({ message: 'Category not found' }, 404);
        }
        return c.json(category, 200);
    }
    catch (error) {
        console.error('Error retrieving category:', error);
        return c.json({ error: 'Internal Error' }, 500);
    }
});
/**
 * CREATE: Býr til nýjan flokk
 */
app.post('/categories', async (c) => {
    let data;
    try {
        data = await c.req.json();
    }
    catch (e) {
        return c.json({ error: 'invalid json' }, 400);
    }
    const validCategory = validateCategory(data);
    if (!validCategory.success) {
        return c.json({ error: 'invalid data', errors: validCategory.error.flatten() }, 400);
    }
    // validCategory.data has the validated object with a title field.
    const { title } = validCategory.data;
    try {
        const { category, created } = await createCategory(title);
        if (created) {
            return c.json(category, 201);
        }
        else {
            return c.json(category, 200);
        }
    }
    catch (error) {
        console.error('Error creating category:', error);
        return c.json({ error: 'Internal Error' }, 500);
    }
});
/**
 * UPDATE: uppfærir flokk
 */
app.patch('/categories/:slug', async (c) => {
    const slugParam = c.req.param('slug');
    let data;
    try {
        data = await c.req.json();
    }
    catch (e) {
        return c.json({ error: 'invalid json' }, 400);
    }
    const valid = validateCategory(data);
    if (!valid.success) {
        return c.json({ error: 'invalid data', errors: valid.error.flatten() }, 400);
    }
    const { title } = valid.data;
    try {
        const updated = await updateCategory(slugParam, title);
        if (!updated) {
            return c.json({ error: 'No category found with this slug' }, 404);
        }
        return c.json(updated, 200);
    }
    catch (err) {
        console.error('Error updating category:', err);
        return c.json({ error: 'Internal error:' }, 500);
    }
});
/**
 * DELETE: eyðir flokki
 */
app.delete('/categories/:slug', async (c) => {
    const slugParam = c.req.param('slug'); //extract parameter
    try {
        const success = await deleteCategory(slugParam);
        if (!success) {
            return c.json({ error: 'Category not found' }, 404);
        }
        return c.json({ message: "Flokki 'slug' hefur verið eytt" }); //204
    }
    catch (error) {
        console.error('Error deleting category', error);
        return c.json({ error: 'Internal error' }, 500);
    }
});
/****************************QUESTIONS************************************* */
/**
 * READ: Skilar öllum spurningum úr öllum flokkum
 */
app.get('/questions', async (c) => {
    try {
        const questions = await getQuestions();
        return c.json(questions);
    }
    catch (err) {
        console.error("Error fetching questions", err);
        return c.json({ message: 'Internal error' }, 500);
    }
});
/**
 * CREATE: Býr til nýja spurningu
 */
app.post('/questions', async (c) => {
    let rawData;
    try {
        rawData = await c.req.json();
    }
    catch (e) {
        return c.json({ error: 'ógilt JSON' }, 400);
    }
    const validationResult = validateQuestion(rawData);
    if (!validationResult.success) {
        const errors = validationResult.error.flatten();
        return c.json({ error: 'Ógild gögn', details: errors }, 400);
    }
    try {
        const newQuestion = await createQuestion(validationResult.data);
        return c.json(newQuestion, 201);
    }
    catch (error) {
        console.error('Error creating question', error);
        return c.json({ error: 'Internal error' }, 500);
    }
});
serve({
    fetch: app.fetch,
    port: 3000
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});
