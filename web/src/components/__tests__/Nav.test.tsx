import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import Nav from '../Nav';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Nav Component', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue('/');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: null }),
      });
    });

    it('renders login link', async () => {
      render(<Nav />);
      
      await waitFor(() => {
        expect(screen.getByText('Login')).toBeTruthy();
      });
      
      expect(screen.getByText('Word Pointe')).toBeTruthy();
      expect(screen.queryByText('Home')).toBeNull();
    });
  });

  describe('when user is authenticated as leader', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      role: 'leader' as const,
      is_leader: true,
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: mockUser }),
      });
    });

    it('renders navigation links without admin options', async () => {
      render(<Nav />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeTruthy();
      });

      // Check main navigation links are present
      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Record')).toBeTruthy();
      expect(screen.getByText('Spend')).toBeTruthy();
      expect(screen.getByText('Users')).toBeTruthy();

      // Leader should not see admin links
      expect(screen.queryByText('Memory Items')).toBeNull();
      expect(screen.queryByText('Reports')).toBeNull();
      expect(screen.queryByText('Settings')).toBeNull();

      // Should not show admin badge
      expect(screen.queryByText('Admin')).toBeNull();
    });
  });

  describe('when user is authenticated as admin', () => {
    const mockUser = {
      id: 'admin1',
      name: 'Admin User',
      role: 'admin' as const,
      is_leader: false,
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: mockUser }),
      });
    });

    it('renders all navigation links including admin options', async () => {
      render(<Nav />);

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeTruthy();
      });

      // Check main navigation links
      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Record')).toBeTruthy();
      expect(screen.getByText('Spend')).toBeTruthy();
      expect(screen.getByText('Users')).toBeTruthy();

      // Admin should see admin links
      expect(screen.getByText('Memory Items')).toBeTruthy();
      expect(screen.getByText('User Records')).toBeTruthy();
      expect(screen.getByText('Reports')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();

      // Should show admin badge
      expect(screen.getByText('Admin')).toBeTruthy();
    });
  });

  describe('navigation highlighting', () => {
    const mockUser = {
      id: 'user1',
      name: 'Test User',
      role: 'leader' as const,
      is_leader: true,
    };

    it('highlights current page', async () => {
      (usePathname as jest.Mock).mockReturnValue('/record');
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: mockUser }),
      });

      render(<Nav />);

      await waitFor(() => {
        const recordLink = screen.getByText('Record');
        expect(recordLink.className).toContain('bg-gradient-to-r');
        expect(recordLink.className).toContain('shadow-md');
      });

      const homeLink = screen.getByText('Home');
      expect(homeLink.className).toContain('text-gray-700');
      expect(homeLink.className).not.toContain('bg-gradient-to-r');
    });
  });

  describe('logout functionality', () => {
    const mockUser = {
      id: 'user1', 
      name: 'Test User',
      role: 'leader' as const,
      is_leader: true,
    };

    it('handles logout correctly', async () => {
      // Mock initial auth check
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          json: async () => ({ user: mockUser }),
        })
        // Mock logout request
        .mockResolvedValueOnce({
          ok: true,
        });

      render(<Nav />);

      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeTruthy();
      });

      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
          method: 'POST',
        });
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('component initialization', () => {
    it('calls auth check on mount', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: null }),
      });

      render(<Nav />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/me');
      });
    });

    it('renders brand link correctly', () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => ({ user: null }),
      });

      render(<Nav />);

      const brandLink = screen.getByText('Word Pointe');
      expect(brandLink.closest('a')).toBeTruthy();
      expect(brandLink.closest('a')?.getAttribute('href')).toBe('/');
    });
  });
});