/** @jest-environment node */

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: jest.fn(),
}));

import { NextRequest } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { GET } from '../users/route';

describe('GET /api/users', () => {
  let mockSupabase: any;
  let mockSummaryQuery: any;
  let mockUsersQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSummaryQuery = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      }),
      then: jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [],
        error: null,
        count: 0,
      })),
    };

    mockUsersQuery = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabase = {
      from: jest.fn((table: string) => {
        if (table === 'user_points_summary') return mockSummaryQuery;
        if (table === 'users') return mockUsersQuery;
        return mockSummaryQuery;
      }),
    };

    (getSupabaseAdmin as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('returns all users when pageSize is omitted', async () => {
    const users = [
      { id: '1', name: 'Aaron', current_points: 0 },
      { id: '2', name: 'Wyatt', current_points: 0 },
    ];

    mockSummaryQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
      data: users,
      error: null,
      count: users.length,
    }));

    mockUsersQuery.in.mockResolvedValue({
      data: [
        { id: '1', password_hash: 'hash' },
        { id: '2', password_hash: null },
      ],
      error: null,
    });

    const request = new NextRequest('http://localhost/api/users');
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.from).toHaveBeenCalledWith('user_points_summary');
    expect(mockSummaryQuery.select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(mockSummaryQuery.order).toHaveBeenCalledWith('name');
    expect(mockSummaryQuery.range).not.toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockUsersQuery.select).toHaveBeenCalledWith('id, password_hash');
    expect(payload).toEqual({
      items: [
        { id: '1', name: 'Aaron', current_points: 0, hasLoginAccess: true },
        { id: '2', name: 'Wyatt', current_points: 0, hasLoginAccess: false },
      ],
      total: users.length,
    });
  });

  it('applies pagination when pageSize is provided', async () => {
    mockSummaryQuery.range.mockResolvedValue({
      data: [{ id: '2', name: 'Wyatt', current_points: 0 }],
      error: null,
      count: 30,
    });

    mockUsersQuery.in.mockResolvedValue({
      data: [{ id: '2', password_hash: 'hash' }],
      error: null,
    });

    const request = new NextRequest('http://localhost/api/users?page=2&pageSize=20');
    const response = await GET(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(mockSummaryQuery.range).toHaveBeenCalledWith(20, 39);
    expect(payload).toEqual({
      items: [{ id: '2', name: 'Wyatt', current_points: 0, hasLoginAccess: true }],
      total: 30,
    });
  });
});