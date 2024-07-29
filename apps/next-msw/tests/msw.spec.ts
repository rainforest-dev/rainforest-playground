import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import axios from 'axios';
import crypto from 'crypto';
import { ab2str, pem, str2ab } from '../src/utils';

vi.stubGlobal('crypto', crypto);

const handlers = [
  http.get('http://example.com/', async () => {
    return HttpResponse.json({
      message: 'Hello World!',
      statusCode: 200,
    });
  }),
  http.get('http://example.com/crypto-api', async ({ request }) => {
    const _publicKey = request.headers.get('x-public-key');
    if (!_publicKey) throw new Error('Public key not found');

    const testMessage = 'Test Message';
    const aesKey = await window.crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encryptedMessage = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv,
      },
      aesKey,
      new TextEncoder().encode(testMessage)
    );
    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      new DataView(str2ab(_publicKey.split('-----')[2])),
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );
    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      new Uint8Array(await window.crypto.subtle.exportKey('raw', aesKey))
    );

    const encryptedIv = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      new Uint8Array(iv)
    );

    const response = {
      ciphertext: btoa(ab2str(encryptedMessage)),
      key: btoa(ab2str(encryptedKey)),
      iv: btoa(ab2str(encryptedIv)),
    };

    return HttpResponse.json({
      data: response,
      status: 200,
      statusText: 'OK',
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
  it('Fetch API: Crypto API', async () => {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const response = await fetch('http://example.com/crypto-api', {
      headers: { 'x-public-key': pem('public', ab2str(publicKey)) },
    });
    expect(response.status).toBe(200);
    const { data } = (await response.json()) as {
      data: {
        ciphertext: string;
        iv: string;
        key: string;
      };
    };
    expect(data.ciphertext).toBeDefined();
    expect(data.iv).toBeDefined();
    expect(data.key).toBeDefined();
  });
  it('Axios', async () => {
    const response = await axios.get('http://example.com/');
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'Hello World!', statusCode: 200 });
  });
  it('Axios: Crypto API', async () => {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
    const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const response = await axios.get('http://example.com/crypto-api', {
      headers: { 'x-public-key': pem('public', ab2str(publicKey)) },
    });
    expect(response.status).toBe(200);
    const { data } = response.data as {
      data: {
        ciphertext: string;
        iv: string;
        key: string;
      };
    };
    expect(data.ciphertext).toBeDefined();
    expect(data.iv).toBeDefined();
    expect(data.key).toBeDefined();
  });
  afterAll(() => {
    server.close();
  });
});
