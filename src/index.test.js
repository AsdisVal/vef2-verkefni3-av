import app from './index.js';

describe('GET /', () => {
  it('should return a 200 status code', async () => {
    const response = await app.fetch(new Request('http://localhost:3000'));
    expect(response.status).toBe(200);
  });
});

export {};
