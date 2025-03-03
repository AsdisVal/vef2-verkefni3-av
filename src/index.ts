import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCategories, getCategory, validateCategory } from './routes/categories.db.js'

const app = new Hono()

app.get('/', (context) => {
  const data = {
    hello:'hono'
  }
  return context.json(data)
})

app.get('/categories', (c) => {

  const categories = getCategories();
  return c.json(categories);
});

app.post('/categories', async (c) => {
  let categoryToCreate: unknown;
  try{
    categoryToCreate = await c.req.json()
    console.log(categoryToCreate);
  } catch (e) {
    return c.json({ error: 'invalid json'}, 
    400);
  }
  const validCategory = validateCategory(categoryToCreate)

  if(!validCategory.success) {
    return c.json({ error: 'invalid data', errors: validCategory.error.flatten()}, 400);
  }

  return c.json(null);
});


serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

app.get('/categories/:slug', (c) => {  // context er eins og req og res
  const slug = c.req.param('slug');
  const category = getCategory(slug);
  if(!category){
    return c.json({message: 'not found'}, 404);
  }
  return c.json(category);
})
