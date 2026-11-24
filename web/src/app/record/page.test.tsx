import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import RecordPage from './page';

const existingUser = { id: 'existing-user', name: 'Alice', is_leader: false, current_points: 0 };
const mockFetch = jest.fn();
let recordOutcome: 'network' | 'server' | 'success';
let users: typeof existingUser[];

const jsonResponse = (data: unknown, ok = true) => ({ ok, json: async () => data });

describe('RecordPage mobile workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockFetch.mockReset();
    recordOutcome = 'network';
    users = [existingUser];
    global.fetch = mockFetch;
    mockFetch.mockImplementation(async (url: string, options?: RequestInit) => {
      if (url === '/api/auth/me') {
        return jsonResponse({ user: { id: 'leader', name: 'Leader', role: 'leader', is_leader: true } });
      }
      if (url.startsWith('/api/users?')) {
        return jsonResponse({ items: users });
      }
      if (url === '/api/users' && options?.method === 'POST') {
        const createdUser = { ...existingUser, id: 'new-user', name: JSON.parse(options.body as string).name };
        users = [...users, createdUser];
        return jsonResponse(createdUser);
      }
      if (url.startsWith('/api/memory-items?')) {
        return jsonResponse({ items: [{
          id: 'existing-verse', reference: 'John 3:16', type: 'verse',
          text: 'Verse text for testing.', bible_version: 'KJV', points_first: 10, points_repeat: 2,
        }] });
      }
      if (url.startsWith('/api/records/check?')) {
        return jsonResponse({ record_type: 'first', count: 0, has_recorded: false, is_first: true });
      }
      if (url.startsWith('/api/bible/verse?')) {
        return jsonResponse({ text: 'Verse text for testing.' });
      }
      if (url.startsWith('https://bible-api.com/')) {
        return jsonResponse({ reference: 'John 3:16', text: 'Verse text for testing.' });
      }
      if (url === '/api/records' && options?.method === 'POST') {
        if (recordOutcome === 'success') return jsonResponse({ points_awarded: 10 });
        if (recordOutcome === 'server') return jsonResponse({ error: 'Failed to save record' }, false);
        throw new Error('Connection lost');
      }
      throw new Error(`Unexpected request: ${url}`);
    });
  });

  it.each(['network', 'server'] as const)('keeps a new reference and selected user after a %s failure and allows a successful retry', async (failure) => {
    recordOutcome = failure;
    render(<RecordPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Choose a user...' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Alice' }));
    fireEvent.click(screen.getByRole('button', { name: '+ New verse' }));
    fireEvent.change(screen.getByPlaceholderText('e.g., John 3:16'), { target: { value: 'John 3:16' } });
    fireEvent.click(screen.getByRole('button', { name: 'Record Memory', exact: true }));

    expect(await screen.findByText(failure === 'network' ? 'Network error' : 'Failed to save record')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., John 3:16')).toHaveValue('John 3:16');
    expect(screen.getByRole('button', { name: 'Alice' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Record Memory', exact: true })).toBeEnabled());

    recordOutcome = 'success';
    fireEvent.click(screen.getByRole('button', { name: 'Record Memory', exact: true }));

    expect(await screen.findByText('New verse added and recorded! +10 points awarded.')).toBeInTheDocument();
    const recordRequests = mockFetch.mock.calls.filter(([url]) => url === '/api/records');
    expect(recordRequests).toHaveLength(2);
    expect(JSON.parse(recordRequests[1][1].body)).toEqual({
      user_id: existingUser.id,
      memory_item_id: 'John 3:16',
      record_type: 'first',
    });
    expect(screen.queryByPlaceholderText('e.g., John 3:16')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Choose a user...' })).toBeInTheDocument();
  });

  it.each(['existing', 'new'] as const)('selects a newly created user and records the pending %s memory item for that user', async (itemType) => {
    recordOutcome = 'success';
    render(<RecordPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Choose a user...' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Alice' }));
    if (itemType === 'new') {
      fireEvent.click(screen.getByRole('button', { name: '+ New verse' }));
      fireEvent.change(screen.getByPlaceholderText('e.g., John 3:16'), { target: { value: 'John 3:16' } });
    } else {
      fireEvent.click(screen.getByRole('button', { name: 'Choose a memory item...' }));
      fireEvent.click(await screen.findByRole('button', { name: /John 3:16/ }));
    }
    fireEvent.click(screen.getByRole('button', { name: '+ New user' }));
    fireEvent.change(screen.getByLabelText('Name *'), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add User', exact: true }));

    expect(await screen.findByRole('button', { name: 'Bob' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Name *')).not.toBeInTheDocument();
    if (itemType === 'new') {
      expect(screen.getByPlaceholderText('e.g., John 3:16')).toHaveValue('John 3:16');
    } else {
      expect(screen.getByRole('button', { name: 'John 3:16' })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Record Memory', exact: true }));

    expect(await screen.findByText(itemType === 'new'
      ? 'New verse added and recorded! +10 points awarded.'
      : 'Recorded! +10 points awarded.')).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith('/api/records', expect.objectContaining({
      body: JSON.stringify({ user_id: 'new-user', memory_item_id: itemType === 'new' ? 'John 3:16' : 'existing-verse', record_type: 'first' }),
    }));
  });
});