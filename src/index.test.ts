import { vi, describe, it, expect } from 'vitest';

// Mock the categories.db module before importing the app
vi.mock('./routes/categories.db.js', () => ({
  getCategories: vi.fn(async () => [
    { id: 1, title: 'Mock Category', slug: 'mock-category' }
  ]),
  // Other functions from categories.db.js can be mocked similarly if needed.
  getCategory: vi.fn(),
  validateCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn()
}));

// Import your app. Using './app' allows Vitest to pick up the TypeScript source.
import app from './app.js';

describe('App Endpoints', () => {
  it('GET / returns greeting', async () => {
    const request = new Request('http://localhost/');
    const response = await app.fetch(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ hello: 'hono' });
  });

  it('GET /categories returns list of categories', async () => {
    const request = new Request('http://localhost/categories');
    const response = await app.fetch(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual([{ id: 1, title: 'Mock Category', slug: 'mock-category' }]);
  });
});