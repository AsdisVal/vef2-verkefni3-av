import { describe, it, expect } from 'vitest';
import app from './app.js'; 

describe('Hono App Endpoints', () => {
  it('GET / should return greeting', async () => {
    const response = await app.fetch(new Request('http://localhost/'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ hello: 'hono' });
  });

  it('GET /categories returns list of categories', async () => {
    const response = await app.fetch(new Request('http://localhost/categories'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([{ id: 1, title: 'Mock Category', slug: 'mock-category' }]);
  });

  // More tests for other endpoints...
});
