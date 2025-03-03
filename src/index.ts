import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCategories, getCategoryDB, validateCategory } from './routes/categories.db.js'

const app = new Hono()
/**
 * Þetta er Homepage
 */
app.get('/', (context) => {
  const data = {
    hello:'hono'
  }
  return context.json(data)
})


/**
 * Listi af flokkunum er hér
 */
app.get('/categories', async (c) => {
  try {
    const categories = await getCategories();
    return c.json(categories);
  } catch (error) {
    console.log('Error fetching categories:', error);
    return c.json({ message: 'Internal Error'}, 500);
  }
});

/**
 * Slóð fyrir hvern flokk er búin til hér
 */
app.get('/categories/:slug', async (c) => {  
  try {
    const slug = c.req.param('slug');
    const category = await getCategoryDB(slug);
    
    if(!category){
      return c.json({message: 'not found'}, 404);
    }
    return c.json(category);
  } catch (error) {
    console.error('Error retrieving category:', error);
    return c.json({ error: 'Internal Error'}, 500);
  }
});

/**
 * Hér búum við til nýjan flokk.
 * 
 * Ef flokkur er nýr-> RETURN: 201 + upplýsingar um flokk 
 * Ef flokkur var nú þegar hér-> RETURN: 200 + uppl.
 * Ef það vantar gögn, gögn á röngu formi eða ólöglegt
 * innihald-> RETURN: 400 
 * Ef villa kom upp-> RETURN: 500
 */
app.post('/category', async (context) => {
  let categoryToCreate: unknown;
  try{
    categoryToCreate = await context.req.json()
    console.log(categoryToCreate);
  } catch (e) {
    return context.json({ error: 'invalid json'}, 400);
  }
  const validCategory = validateCategory(categoryToCreate)
  if(!validCategory.success) {
    return context.json({ error: 'invalid data', errors: validCategory.error.flatten()}, 400);
  }
  return context.json(null);
});

app.patch('/category/:slug');
app.delete('/category/:slug');

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


