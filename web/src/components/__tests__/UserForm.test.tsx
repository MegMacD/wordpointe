import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../UserForm';

// Mock fetch globally
global.fetch = jest.fn();

describe('UserForm', () => {
  const mockOnUserAdded = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('basic rendering', () => {
    it('renders form with all required fields', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      expect(screen.getByText('Add New User')).toBeTruthy();
      expect(screen.getByLabelText('Name *')).toBeTruthy();
      expect(screen.getByLabelText('This person is a leader')).toBeTruthy();
      expect(screen.getByLabelText('Notes (Optional)')).toBeTruthy();
      expect(screen.getByText('Add User')).toBeTruthy();
    });

    it('renders in compact mode', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} compact={true} />);

      expect(screen.queryByText('Add New User')).toBeNull();
      expect(screen.getByLabelText('Name *')).toBeTruthy();
      expect(screen.getByLabelText('This person is a leader')).toBeTruthy();
      expect(screen.queryByLabelText('Notes (Optional)')).toBeNull(); // Hidden in compact mode
      expect(screen.getByText('Add')).toBeTruthy();
    });

    it('renders cancel button when onCancel is provided', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} onCancel={mockOnCancel} />);

      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('renders compact cancel button when onCancel is provided in compact mode', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} onCancel={mockOnCancel} compact={true} />);

      expect(screen.getByText('Cancel')).toBeTruthy();
    });
  });

  describe('form validation', () => {
    it('disables submit button when name is empty', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const submitButton = screen.getByText('Add User');
      expect(submitButton.getAttribute('disabled')).not.toBeNull();
    });

    it('enables submit button when name is provided', async () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      expect(submitButton.getAttribute('disabled')).toBeNull();
    });
  });

  describe('form interaction', () => {
    it('updates name input value', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      expect(nameInput.value).toBe('John Doe');
    });

    it('toggles leader checkbox', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const leaderCheckbox = screen.getByLabelText('This person is a leader') as HTMLInputElement;
      expect(leaderCheckbox.checked).toBe(false);

      fireEvent.click(leaderCheckbox);
      expect(leaderCheckbox.checked).toBe(true);

      fireEvent.click(leaderCheckbox);
      expect(leaderCheckbox.checked).toBe(false);
    });

    it('updates notes textarea value', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const notesTextarea = screen.getByLabelText('Notes (Optional)') as HTMLTextAreaElement;
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      expect(notesTextarea.value).toBe('Test notes');
    });

    it('calls onCancel when cancel button is clicked', () => {
      render(<UserForm onUserAdded={mockOnUserAdded} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('form submission', () => {
    it('submits form with basic user data', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            is_leader: false,
          }),
        });
      });

      expect(mockOnUserAdded).toHaveBeenCalledTimes(1);
    });

    it('submits form with leader status', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

      const leaderCheckbox = screen.getByLabelText('This person is a leader');
      fireEvent.click(leaderCheckbox);

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Jane Smith',
            is_leader: true,
          }),
        });
      });
    });

    it('submits form with notes', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'Bob Wilson' } });

      const notesTextarea = screen.getByLabelText('Notes (Optional)');
      fireEvent.change(notesTextarea, { target: { value: 'Great singer' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Bob Wilson',
            is_leader: false,
            notes: 'Great singer',
          }),
        });
      });
    });

    it('trims whitespace from name and notes before submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });

      const notesTextarea = screen.getByLabelText('Notes (Optional)');
      fireEvent.change(notesTextarea, { target: { value: '  Some notes  ' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            is_leader: false,
            notes: 'Some notes',
          }),
        });
      });
    });

    it('excludes empty notes from submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const notesTextarea = screen.getByLabelText('Notes (Optional)');
      fireEvent.change(notesTextarea, { target: { value: '   ' } }); // Only whitespace

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'John Doe',
            is_leader: false,
            // notes should not be included
          }),
        });
      });
    });

    it('resets form after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
      const leaderCheckbox = screen.getByLabelText('This person is a leader') as HTMLInputElement;
      const notesTextarea = screen.getByLabelText('Notes (Optional)') as HTMLTextAreaElement;

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.click(leaderCheckbox);
      fireEvent.change(notesTextarea, { target: { value: 'Test notes' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnUserAdded).toHaveBeenCalled();
      });

      // Form should be reset
      expect(nameInput.value).toBe('');
      expect(leaderCheckbox.checked).toBe(false);
      expect(notesTextarea.value).toBe('');
    });
  });

  describe('error handling', () => {
    it('displays server error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'User already exists' }),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('User already exists')).toBeTruthy();
      });

      expect(mockOnUserAdded).not.toHaveBeenCalled();
    });

    it('displays generic error for failed requests without error message', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create user')).toBeTruthy();
      });
    });

    it('displays network error message', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeTruthy();
      });
    });
  });

  describe('loading state', () => {
    it('shows loading state during submission', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValue(promise);

      render(<UserForm onUserAdded={mockOnUserAdded} />);

      const nameInput = screen.getByLabelText('Name *');
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });

      const submitButton = screen.getByText('Add User');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Adding...')).toBeTruthy();
      });

      // Form inputs should be disabled
      expect(nameInput.getAttribute('disabled')).not.toBeNull();
      expect(screen.getByLabelText('This person is a leader').getAttribute('disabled')).not.toBeNull();
      expect(screen.getByLabelText('Notes (Optional)').getAttribute('disabled')).not.toBeNull();
      expect(submitButton.getAttribute('disabled')).not.toBeNull();

      // Resolve the promise to finish the test
      resolvePromise!({
        ok: true,
        json: async () => ({ success: true }),
      });

      await waitFor(() => {
        expect(screen.getByText('Add User')).toBeTruthy(); // Back to normal state
      });
    });
  });
});