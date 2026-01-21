import { GET, PUT, DELETE } from '../route';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { requireAuth } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/lib/supabase-server');
jest.mock('@/lib/auth');

const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

describe('/api/users/[id] API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSupabaseAdmin as jest.Mock).mockReturnValue(mockSupabase);
    (requireAuth as jest.Mock).mockResolvedValue(undefined);
  });

  describe('GET /api/users/[id]', () => {
    it('should return user with points', async () => {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        is_leader: false,
        notes: 'Test notes',
        created_at: '2023-01-01T00:00:00Z'
      };

      const mockPointsData = { current_points: 150 };

      // Mock user query
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: mockUser, error: null })
        .mockResolvedValueOnce({ data: mockPointsData, error: null });

      const request = new NextRequest('http://localhost/api/users/1');
      const params = Promise.resolve({ id: '1' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        ...mockUser,
        current_points: 150,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.from).toHaveBeenCalledWith('user_points_summary');
    });

    it('should return 404 for non-existent user', async () => {
      mockSupabase.from().select().eq().single
        .mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      const request = new NextRequest('http://localhost/api/users/999');
      const params = Promise.resolve({ id: '999' });

      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('PUT /api/users/[id]', () => {
    it('should update user successfully', async () => {
      const updatedUser = {
        id: '1',
        name: 'Jane Doe',
        is_leader: true,
        notes: 'Updated notes',
        created_at: '2023-01-01T00:00:00Z'
      };

      mockSupabase.from().update().eq().select().single
        .mockResolvedValue({ data: updatedUser, error: null });

      const request = new NextRequest('http://localhost/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Doe',
          is_leader: true,
          notes: 'Updated notes',
        }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedUser);

      expect(requireAuth).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should return 401 when not authenticated', async () => {
      (requireAuth as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest('http://localhost/api/users/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Doe',
        }),
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent user', async () => {
      mockSupabase.from().update().eq().select().single
        .mockResolvedValue({ data: null, error: null });

      const request = new NextRequest('http://localhost/api/users/999', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Jane Doe',
        }),
      });
      const params = Promise.resolve({ id: '999' });

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('DELETE /api/users/[id]', () => {
    it('should delete user successfully', async () => {
      // Mock user exists check
      mockSupabase.from().select().eq().single
        .mockResolvedValue({ data: { id: '1' }, error: null });

      // Mock delete operation
      mockSupabase.from().delete().eq
        .mockResolvedValue({ error: null });

      const request = new NextRequest('http://localhost/api/users/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(requireAuth).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledWith('users');
    });

    it('should return 401 when not authenticated', async () => {
      (requireAuth as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      const request = new NextRequest('http://localhost/api/users/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 for non-existent user', async () => {
      mockSupabase.from().select().eq().single
        .mockResolvedValue({ data: null, error: { message: 'Not found' } });

      const request = new NextRequest('http://localhost/api/users/999', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '999' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should handle database errors', async () => {
      // Mock user exists check
      mockSupabase.from().select().eq().single
        .mockResolvedValue({ data: { id: '1' }, error: null });

      // Mock delete operation failure
      mockSupabase.from().delete().eq
        .mockResolvedValue({ error: { message: 'Database error' } });

      const request = new NextRequest('http://localhost/api/users/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database error');
    });
  });
});