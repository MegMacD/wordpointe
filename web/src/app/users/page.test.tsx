import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import UsersPage from './page';

jest.mock('@/components/AuthGuard', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/UserForm', () => ({
  __esModule: true,
  default: () => <div>UserForm</div>,
}));

jest.mock('@/components/emojiIconOptions', () => ({
  EMOJI_ICON_OPTIONS: [],
}));

global.fetch = jest.fn();

describe('UsersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuthMe = () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { role: 'admin' } }),
        });
      }
      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });
  };

  it('loads the users list with explicit pagination on mount', async () => {
    mockAuthMe();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { role: 'admin' } }),
        });
      }

      if (url === '/api/users?page=1&pageSize=20') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [{ id: '1', name: 'Alice', is_leader: false, current_points: 0 }],
            total: 25,
          }),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users?page=1&pageSize=20',
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });

    expect(await screen.findByText('Showing 1-1 of 25 users')).toBeTruthy();
    expect(screen.getByText('Page 1 of 2')).toBeTruthy();
  });

  it('fetches next page when Next button is clicked', async () => {
    mockAuthMe();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/auth/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: { role: 'admin' } }),
        });
      }

      if (url === '/api/users?page=1&pageSize=20') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [{ id: '1', name: 'Alice', is_leader: false, current_points: 0 }],
            total: 25,
          }),
        });
      }

      if (url === '/api/users?page=2&pageSize=20') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            items: [{ id: '2', name: 'Bob', is_leader: false, current_points: 0 }],
            total: 25,
          }),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });

    render(<UsersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users?page=1&pageSize=20',
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });

    // Wait for the user list to appear
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Wait for the second page fetch to resolve and render the new user
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users?page=2&pageSize=20',
        expect.objectContaining({ signal: expect.any(Object) })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeTruthy();
    });

    expect(screen.getByText('Page 2 of 2')).toBeTruthy();
  });
});