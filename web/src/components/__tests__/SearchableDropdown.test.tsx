import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchableDropdown from '../SearchableDropdown';

const mockOptions = [
  { id: '1', label: 'Apple', secondary: 'Fruit' },
  { id: '2', label: 'Banana', secondary: 'Yellow fruit' },
  { id: '3', label: 'Carrot', secondary: 'Vegetable' },
  { id: '4', label: 'Disabled Option', secondary: 'Cannot select', disabled: true },
];

describe('SearchableDropdown', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders with placeholder when no value selected', () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
          placeholder="Choose an option"
        />
      );

      expect(screen.getByText('Choose an option')).toBeTruthy();
    });

    it('renders with selected value', () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value="1"
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Apple')).toBeTruthy();
    });

    it('renders with label', () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
          label="Select Fruit"
        />
      );

      expect(screen.getByText('Select Fruit')).toBeTruthy();
    });
  });

  describe('dropdown interaction', () => {
    it('opens dropdown when clicked', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
        expect(screen.getByText('Banana')).toBeTruthy();
        expect(screen.getByText('Carrot')).toBeTruthy();
      });
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <SearchableDropdown
            options={mockOptions}
            value=""
            onSelect={mockOnSelect}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
      });

      fireEvent.mouseDown(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByText('Apple')).toBeNull();
      });
    });

    it('selects option when clicked', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Banana')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Banana'));

      expect(mockOnSelect).toHaveBeenCalledWith('2');
    });
  });

  describe('search functionality', () => {
    it('filters options based on search input', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
          searchPlaceholder="Search items..."
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search items...')).toBeTruthy();
      });

      const searchInput = screen.getByPlaceholderText('Search items...');
      fireEvent.change(searchInput, { target: { value: 'app' } });

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
        expect(screen.queryByText('Banana')).toBeNull();
        expect(screen.queryByText('Carrot')).toBeNull();
      });
    });

    it('filters options based on secondary text', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'fruit' } });

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
        expect(screen.getByText('Banana')).toBeTruthy();
        expect(screen.queryByText('Carrot')).toBeNull();
      });
    });

    it('shows empty message when no options match search', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
          emptyMessage="No matches found"
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'xyz' } });

      await waitFor(() => {
        expect(screen.getByText('No matches found')).toBeTruthy();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown with Enter key', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
      });
    });

    it('navigates options with arrow keys', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      const searchInput = screen.getByPlaceholderText('Search...');
      
      // Arrow down should highlight first option
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      
      // Arrow down again should highlight second option
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      
      // Enter should select the highlighted option
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      expect(mockOnSelect).toHaveBeenCalledWith('2'); // Second option (Banana)
    });

    it('closes dropdown with Escape key', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeTruthy();
      });

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.keyDown(searchInput, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByText('Apple')).toBeNull();
      });
    });
  });

  describe('disabled state', () => {
    it('does not open when disabled', () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      
      fireEvent.click(button);
      
      expect(screen.queryByText('Apple')).toBeNull();
    });

    it('does not select disabled options', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Disabled Option')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Disabled Option'));

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe('custom rendering', () => {
    it('uses custom render function when provided', async () => {
      const customRenderOption = (option: any, isSelected: boolean) => (
        <div data-testid={`custom-${option.id}`}>
          Custom: {option.label} {isSelected ? '(selected)' : ''}
        </div>
      );

      render(
        <SearchableDropdown
          options={mockOptions}
          value="1"
          onSelect={mockOnSelect}
          renderOption={customRenderOption}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('custom-1')).toBeTruthy();
        expect(screen.getByText('Custom: Apple (selected)')).toBeTruthy();
        expect(screen.getByText('Custom: Banana')).toBeTruthy();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      expect(button.getAttribute('aria-haspopup')).toBe('listbox');
      expect(button.getAttribute('aria-expanded')).toBe('false');
    });

    it('updates aria-expanded when opened', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button.getAttribute('aria-expanded')).toBe('true');
      });
    });

    it('focuses search input when dropdown opens', async () => {
      render(
        <SearchableDropdown
          options={mockOptions}
          value=""
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search...');
        expect(document.activeElement).toBe(searchInput);
      });
    });
  });
});