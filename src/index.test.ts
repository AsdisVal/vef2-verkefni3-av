import { describe, it, expect } from 'vitest';
import app from './index.js'; // Ensure the path is correct

describe('GET /', () => {
  it('returns a JSON greeting', async () => {
    const response = await app.fetch(new Request('http://localhost/'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ hello: 'hono' });
  });
});
