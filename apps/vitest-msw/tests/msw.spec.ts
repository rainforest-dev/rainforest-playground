import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import axios from 'axios';

const handlers = [
  http.get('http://example.com/', async () => {
    return HttpResponse.json({
      message: 'Hello World!',
      statusCode: 200,
    });
  }),
];

const server = setupServer(...handlers);

describe('unit tests with msw', () => {
  beforeAll(() => {
    server.listen();
  });
  it('Fetch API', async () => {
    const response = await fetch('http://example.com/');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: 'Hello World!',
      statusCode: 200,
    });
  });
  it('Axios', async () => {
    const response = await axios.get('http://example.com/');
    console.log('axios response', response);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'Hello World!', statusCode: 200 });
  });
  afterAll(() => {
    server.close();
  });
});
