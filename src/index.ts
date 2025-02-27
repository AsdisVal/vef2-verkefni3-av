import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { getCategories } from './categories.db.js'

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
serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
