import { NextRequest } from 'next/server';

export function createRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  
  const requestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body && (method === 'POST' || method === 'PATCH' || method === 'PUT') 
      ? JSON.stringify(body) 
      : undefined,
  };

  return new NextRequest(fullUrl, requestInit);
}

export function createMockSupabaseClient() {
  const mockClient: any = {
    from: jest.fn(() => mockClient),
    select: jest.fn(() => mockClient),
    insert: jest.fn(() => mockClient),
    update: jest.fn(() => mockClient),
    delete: jest.fn(() => mockClient),
    eq: jest.fn(() => mockClient),
    gte: jest.fn(() => mockClient),
    lte: jest.fn(() => mockClient),
    single: jest.fn(),
    order: jest.fn(() => mockClient),
    limit: jest.fn(() => mockClient),
  };

  return mockClient;
}