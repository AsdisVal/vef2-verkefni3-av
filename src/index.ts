import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
import { getCategories, getCategoryDB, validateCategory, createCategory, updateCategory, deleteCategory } from './routes/categories.db.js'

const app = new Hono()
/**
 * Þetta er Homepage
 */
app.use(prettyJSON()) // With options: prettyJSON({ space: 4 })
app.get('/', (c) => {
  const data = {
    hello:'hono'
  }
  return c.json(data)
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
app.post('/category', async (c) => {
  let data: unknown;
  try{
    data = await c.req.json()
  } catch (e) {
    return c.json({ error: 'invalid json'}, 400);
  }
  const validCategory = validateCategory(data)
  if(!validCategory.success) {
    return c.json({ error: 'invalid data', errors: validCategory.error.flatten()}, 400);
  }

  // validCategory.data has the validated object with a title field.
  const { title } = validCategory.data;
  try {
    const { category, created } = await createCategory(title);
    if (created) {
      return c.json(category, 201);
    } else {
      return c.json(category, 200);
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Internal Error' }, 500);
  }
});

/**
 * PATCH: Uppfærir category
 */
app.patch('/category/:slug', async (c) => {
  const slug = c.req.param('slug');
  let updateData: unknown;

  try {
    updateData = await c.req.json();
  } catch (e) {
    return c.json({ error: 'invalid json'}, 400);
  }

  const validUpdate = validateCategory(updateData);
  if(!validUpdate.success) {
    return c.json( { error: 'invalid data', errors: validUpdate.error.flatten()}, 400);
  }
  const { title } = validUpdate.data;
  try {
    const updatedCategory = await updateCategory(slug, title);
    if(!updatedCategory) {
      return c.json({ error: 'Category not found'}, 404);
    }
    return c.json(updatedCategory, 200);
  } catch (error) {
    console.error('Error updating category:', error);
    return c.json({ error: 'Internal error:'}, 500);
  }
})

app.delete('/category/:slug', async (c) => {
  const slug = c.req.param('slug'); //extract parameter
  
  try {
    const success = await deleteCategory(slug);
    if(!success) {
      return c.json({error: 'Category not found'}, 404);
    }
    return c.text(`${slug} is deleted!`);
  } catch (error) {
    console.error('Error deleting category', error);
    return c.json({error: 'Internal error'}, 500)
  }
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})


