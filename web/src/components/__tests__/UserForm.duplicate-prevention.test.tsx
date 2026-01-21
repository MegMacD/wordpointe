import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserForm from '../UserForm';

// Mock fetch
global.fetch = jest.fn();

const mockExistingUsers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' },
  { id: '3', name: 'Bob Johnson' },
];

describe('UserForm - Duplicate Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('shows duplicate warning when typing existing user name', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    
    // Type existing user name
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    // Should show duplicate warning
    await waitFor(() => {
      expect(screen.getByText(/A user with this name already exists/i)).toBeInTheDocument();
    });
    
    // Warning styling should be applied
    expect(nameInput).toHaveClass('border-amber-300');
  });

  it('shows duplicate warning for case-insensitive matches', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    
    // Type existing user name with different case
    fireEvent.change(nameInput, { target: { value: 'JOHN DOE' } });
    
    // Should show duplicate warning
    await waitFor(() => {
      expect(screen.getByText(/A user with this name already exists/i)).toBeInTheDocument();
    });
  });

  it('hides duplicate warning when typing unique name', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    
    // First type duplicate name
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    await waitFor(() => {
      expect(screen.getByText(/A user with this name already exists/i)).toBeInTheDocument();
    });
    
    // Then type unique name
    fireEvent.change(nameInput, { target: { value: 'Unique Name' } });
    
    // Warning should be hidden
    await waitFor(() => {
      expect(screen.queryByText(/A user with this name already exists/i)).not.toBeInTheDocument();
    });
    
    // Normal styling should be restored
    expect(nameInput).toHaveClass('border-gray-300');
  });

  it('prevents form submission with duplicate name', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add user/i });
    
    // Type duplicate name
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/A user named "John Doe" already exists/i)).toBeInTheDocument();
    });
    
    // Should not have called API
    expect(fetch).not.toHaveBeenCalled();
    expect(mockOnUserAdded).not.toHaveBeenCalled();
  });

  it('allows form submission with unique name', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add user/i });
    
    // Type unique name
    fireEvent.change(nameInput, { target: { value: 'Unique Name' } });
    
    // Submit form
    fireEvent.click(submitButton);
    
    // Should call API
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/users', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Unique Name',
          is_leader: false,
        }),
      }));
    });
    
    expect(mockOnUserAdded).toHaveBeenCalled();
  });

  it('works correctly when no existing users provided', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    const submitButton = screen.getByRole('button', { name: /add user/i });
    
    // Type any name
    fireEvent.change(nameInput, { target: { value: 'Any Name' } });
    
    // Should not show warning
    expect(screen.queryByText(/A user with this name already exists/i)).not.toBeInTheDocument();
    
    // Submit should work
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  it('trims whitespace when checking for duplicates', async () => {
    const mockOnUserAdded = jest.fn();
    
    render(
      <UserForm 
        onUserAdded={mockOnUserAdded}
        existingUsers={mockExistingUsers}
      />
    );

    const nameInput = screen.getByLabelText(/name/i);
    
    // Type existing name with extra whitespace
    fireEvent.change(nameInput, { target: { value: '  John Doe  ' } });
    
    // Should show duplicate warning
    await waitFor(() => {
      expect(screen.getByText(/A user with this name already exists/i)).toBeInTheDocument();
    });
  });
});