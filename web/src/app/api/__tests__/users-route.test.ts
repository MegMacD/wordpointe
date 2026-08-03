/** @jest-environment node */

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: jest.fn(),
}));
    let mockUserListQuery: any;
    let mockAuthUsersQuery: any;
    let mockVerseQuery: any;
    let mockBonusQuery: any;
    let mockSpendQuery: any;

    const createThenableQuery = (response: any) => ({
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn((resolve: (value: unknown) => unknown) => resolve(response)),
    });
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { GET } from '../users/route';

describe('GET /api/users', () => {
      mockUserListQuery = createThenableQuery({
        data: [],
        error: null,
        count: 0,
      });

      mockAuthUsersQuery = createThenableQuery({
        data: [],
        error: null,
      });

      mockVerseQuery = createThenableQuery({
        data: [],
        error: null,
      });

      mockBonusQuery = createThenableQuery({
        data: [],
        error: null,
      });

      mockSpendQuery = createThenableQuery({
        data: [],
        error: null,
      });

      mockUserListQuery.range.mockReturnValue(mockUserListQuery);
      mockAuthUsersQuery.in.mockReturnValue(mockAuthUsersQuery);
      mockVerseQuery.in.mockReturnValue(mockVerseQuery);
      mockBonusQuery.in.mockReturnValue(mockBonusQuery);
      mockSpendQuery.in.mockReturnValue(mockSpendQuery);
      mockSpendQuery.eq.mockReturnValue(mockSpendQuery);

      mockSupabase = {
        from: jest.fn((table: string) => {
          if (table === 'users') {
            const callIndex = (mockSupabase.from.mock.calls.filter((call: any[]) => call[0] === 'users').length);
            return callIndex === 1 ? mockUserListQuery : mockAuthUsersQuery;
          }
          if (table === 'verse_records') return mockVerseQuery;
          if (table === 'bonus_records') return mockBonusQuery;
          if (table === 'spend_records') return mockSpendQuery;
          return mockUserListQuery;
        }),
      };

      (getSupabaseAdmin as jest.Mock).mockReturnValue(mockSupabase);
    });

    it('returns all users when pageSize is omitted', async () => {
      const users = [
        { id: '1', name: 'Aaron', is_leader: false, notes: null, display_accommodation_note: false, emojiIcon: null },
        { id: '2', name: 'Wyatt', is_leader: true, notes: 'Leader note', display_accommodation_note: true, emojiIcon: '⭐' },
      ];

      mockUserListQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: users,
        error: null,
        count: users.length,
      }));

      mockVerseQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { user_id: '1', points_awarded: 40 },
          { user_id: '2', points_awarded: 100 },
        ],
        error: null,
      }));

      mockBonusQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { user_id: '1', points_awarded: 10 },
          { user_id: '2', points_awarded: 25 },
        ],
        error: null,
      }));

      mockSpendQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { user_id: '1', points_spent: 5 },
          { user_id: '2', points_spent: 20 },
        ],
        error: null,
      }));

      mockAuthUsersQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { id: '1', password_hash: 'hash' },
          { id: '2', password_hash: null },
        ],
        error: null,
      }));

      const request = new NextRequest('http://localhost/api/users');
      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.from).toHaveBeenCalledWith('verse_records');
      expect(mockSupabase.from).toHaveBeenCalledWith('bonus_records');
      expect(mockSupabase.from).toHaveBeenCalledWith('spend_records');
      expect(payload).toEqual({
        items: [
          {
            id: '1',
            name: 'Aaron',
            is_leader: false,
            notes: null,
            displayAccommodationNote: false,
            emojiIcon: null,
            current_points: 45,
            hasLoginAccess: true,
          },
          {
            id: '2',
            name: 'Wyatt',
            is_leader: true,
            notes: 'Leader note',
            displayAccommodationNote: true,
            emojiIcon: '⭐',
            current_points: 105,
            hasLoginAccess: false,
          },
        ],
        total: users.length,
      });
    });

    it('applies pagination when pageSize is provided', async () => {
      mockUserListQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [{ id: '2', name: 'Wyatt', is_leader: true, notes: null, display_accommodation_note: false, emojiIcon: null }],
        error: null,
        count: 30,
      }));

      mockVerseQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [{ user_id: '2', points_awarded: 100 }],
        error: null,
      }));

      mockBonusQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [{ user_id: '2', points_awarded: 25 }],
        error: null,
      }));

      mockSpendQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [{ user_id: '2', points_spent: 20 }],
        error: null,
      }));

      mockAuthUsersQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [{ id: '2', password_hash: 'hash' }],
        error: null,
      }));

      const request = new NextRequest('http://localhost/api/users?page=2&pageSize=20');
      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(mockUserListQuery.range).toHaveBeenCalledWith(20, 39);
      expect(payload).toEqual({
        items: [{ id: '2', name: 'Wyatt', is_leader: true, notes: null, displayAccommodationNote: false, emojiIcon: null, current_points: 105, hasLoginAccess: true }],
        total: 30,
      });
    });

    it('returns all users when pageSize=all', async () => {
      const users = [
        { id: '1', name: 'Aaron', is_leader: false, notes: null, display_accommodation_note: false, emojiIcon: null },
        { id: '2', name: 'Wyatt', is_leader: true, notes: null, display_accommodation_note: false, emojiIcon: null },
        { id: '3', name: 'Zoey', is_leader: false, notes: null, display_accommodation_note: false, emojiIcon: null },
      ];

      mockUserListQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: users,
        error: null,
        count: users.length,
      }));

      mockVerseQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { user_id: '1', points_awarded: 40 },
          { user_id: '2', points_awarded: 100 },
          { user_id: '3', points_awarded: 12 },
        ],
        error: null,
      }));

      mockBonusQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [],
        error: null,
      }));

      mockSpendQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [],
        error: null,
      }));

      mockAuthUsersQuery.then = jest.fn((resolve: (value: unknown) => unknown) => resolve({
        data: [
          { id: '1', password_hash: 'hash' },
          { id: '2', password_hash: null },
          { id: '3', password_hash: 'hash' },
        ],
        error: null,
      }));

      const request = new NextRequest('http://localhost/api/users?pageSize=all');
      const response = await GET(request);
      const payload = await response.json();

      expect(response.status).toBe(200);
      expect(mockUserListQuery.range).not.toHaveBeenCalled();
      expect(payload).toEqual({
        items: [
          { id: '1', name: 'Aaron', is_leader: false, notes: null, displayAccommodationNote: false, emojiIcon: null, current_points: 40, hasLoginAccess: true },
          { id: '2', name: 'Wyatt', is_leader: true, notes: null, displayAccommodationNote: false, emojiIcon: null, current_points: 100, hasLoginAccess: false },
          { id: '3', name: 'Zoey', is_leader: false, notes: null, displayAccommodationNote: false, emojiIcon: null, current_points: 12, hasLoginAccess: true },
        ],
        total: users.length,
      });
    });
    });
  });
});