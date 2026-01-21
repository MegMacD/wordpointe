import { computePoints } from '../points';
import type { MemoryItem } from '../types';

describe('Points Computation', () => {
  const mockMemoryItem: MemoryItem = {
    id: 'test-id',
    type: 'verse',
    reference: 'John 3:16',
    text: 'For God so loved...',
    points_first: 10,
    points_repeat: 5,
    active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  };

  it('should compute first-time points correctly', () => {
    const result = computePoints(mockMemoryItem, 'first');

    expect(result.points_awarded).toBe(10);
    expect(result.applied_multiplier).toBe(1.0);
    expect(result.applied_promo).toBeNull();
  });

  it('should compute repeat points correctly', () => {
    const result = computePoints(mockMemoryItem, 'repeat');

    expect(result.points_awarded).toBe(5);
    expect(result.applied_multiplier).toBe(1.0);
    expect(result.applied_promo).toBeNull();
  });

  it('should apply multiplier for promotions', () => {
    const result = computePoints(mockMemoryItem, 'first', {
      multiplier: 2.0,
      promo: 'Double Points Month',
    });

    expect(result.points_awarded).toBe(20); // 10 * 2
    expect(result.applied_multiplier).toBe(2.0);
    expect(result.applied_promo).toBe('Double Points Month');
  });

  it('should apply multiplier to repeat points', () => {
    const result = computePoints(mockMemoryItem, 'repeat', {
      multiplier: 1.5,
    });

    expect(result.points_awarded).toBe(8); // 5 * 1.5 = 7.5, rounded to 8
    expect(result.applied_multiplier).toBe(1.5);
  });

  it('should handle zero points', () => {
    const zeroItem: MemoryItem = {
      ...mockMemoryItem,
      points_first: 0,
      points_repeat: 0,
    };

    const result = computePoints(zeroItem, 'first');
    expect(result.points_awarded).toBe(0);
  });

  it('should round points correctly', () => {
    const item: MemoryItem = {
      ...mockMemoryItem,
      points_first: 7,
    };

    const result = computePoints(item, 'first', { multiplier: 1.5 });
    expect(result.points_awarded).toBe(11); // 7 * 1.5 = 10.5, rounded to 11
  });
});

