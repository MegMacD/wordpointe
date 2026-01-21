import { computePoints, getCurrentPoints } from '@/lib/points';

// Mock Supabase
let mockSupabaseData: any = null;
let mockSupabaseError: any = null;

const mockSupabaseClient: any = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn(() => Promise.resolve({
    data: mockSupabaseData,
    error: mockSupabaseError,
  })),
};

jest.mock('@/lib/supabase-server', () => ({
  getSupabaseAdmin: () => mockSupabaseClient,
}));

describe('Points Library', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseData = null;
    mockSupabaseError = null;
  });

  describe('computePoints', () => {
    it('should compute first-time points correctly', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 10,
        points_repeat: 5,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first');

      expect(result.points_awarded).toBe(10);
      expect(result.applied_multiplier).toBe(1);
      expect(result.applied_promo).toBeNull();
    });

    it('should compute repeat points correctly', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 10,
        points_repeat: 5,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'repeat');

      expect(result.points_awarded).toBe(5);
      expect(result.applied_multiplier).toBe(1);
      expect(result.applied_promo).toBeNull();
    });

    it('should apply multipliers correctly', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 10,
        points_repeat: 5,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first', { multiplier: 2 });

      expect(result.points_awarded).toBe(20);
      expect(result.applied_multiplier).toBe(2);
      expect(result.applied_promo).toBeNull();
    });

    it('should handle custom memory items', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'custom' as const,
        reference: 'Custom Reference',
        text: 'Custom text',
        points_first: 15,
        points_repeat: 8,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first');

      expect(result.points_awarded).toBe(15);
      expect(result.applied_multiplier).toBe(1);
      expect(result.applied_promo).toBeNull();
    });

    it('should handle zero points', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 0,
        points_repeat: 0,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first');

      expect(result.points_awarded).toBe(0);
      expect(result.applied_multiplier).toBe(1);
      expect(result.applied_promo).toBeNull();
    });

    it('should handle promotional bonuses', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 10,
        points_repeat: 5,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first', { promo: 'double-points' });

      expect(result.points_awarded).toBe(10); // Base implementation doesn't apply promo yet
      expect(result.applied_multiplier).toBe(1);
      expect(result.applied_promo).toBe('double-points');
    });

    it('should round fractional points', () => {
      const memoryItem = {
        id: 'item-1',
        type: 'verse' as const,
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        points_first: 3,
        points_repeat: 2,
        active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = computePoints(memoryItem, 'first', { multiplier: 1.5 });

      expect(result.points_awarded).toBe(5); // 3 * 1.5 = 4.5, rounded to 5
      expect(result.applied_multiplier).toBe(1.5);
    });
  });

  describe('getCurrentPoints', () => {
    it('should fetch current points for a user', async () => {
      mockSupabaseData = { current_points: 150 };

      const points = await getCurrentPoints(mockSupabaseClient, 'user-1');

      expect(points).toBe(150);
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('current_points');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('should return 0 for user not found', async () => {
      mockSupabaseError = { code: 'PGRST116' };

      const points = await getCurrentPoints(mockSupabaseClient, 'non-existent-user');

      expect(points).toBe(0);
    });

    it('should return 0 for null points', async () => {
      mockSupabaseData = { current_points: null };

      const points = await getCurrentPoints(mockSupabaseClient, 'user-1');

      expect(points).toBe(0);
    });

    it('should handle database errors', async () => {
      mockSupabaseError = { message: 'Database connection failed' };

      const points = await getCurrentPoints(mockSupabaseClient, 'user-1');

      expect(points).toBe(0);
    });

    it('should handle undefined points field', async () => {
      mockSupabaseData = {}; // No points field

      const points = await getCurrentPoints(mockSupabaseClient, 'user-1');

      expect(points).toBe(0);
    });

    it('should handle negative points', async () => {
      mockSupabaseData = { current_points: -50 };

      const points = await getCurrentPoints(mockSupabaseClient, 'user-1');

      expect(points).toBe(-50); // Should preserve negative values
    });
  });
});