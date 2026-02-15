'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: string;
  label: string;
  secondary?: string;
  disabled?: boolean;
  group?: string;
  badge?: string;
  count?: number;
  icon?: string; // Emoji icon for users
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  renderOption?: (option: Option, isSelected: boolean) => React.ReactNode;
  emptyMessage?: string;
  showGroups?: boolean;
  showCount?: boolean;
}

export default function SearchableDropdown({
  options,
  value,
  onSelect,
  placeholder = "Select an option...",
  label,
  searchPlaceholder = "Search...",
  className = "",
  disabled = false,
  renderOption,
  emptyMessage = "No options found",
  showGroups = false,
  showCount = true
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(search.toLowerCase()) ||
    (option.secondary && option.secondary.toLowerCase().includes(search.toLowerCase()))
  );

  // Group options if showGroups is enabled
  const groupedOptions = showGroups 
    ? filteredOptions.reduce((acc, option) => {
        const group = option.group || 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
      }, {} as Record<string, Option[]>)
    : { 'All': filteredOptions };

  const totalFilteredCount = filteredOptions.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const option = filteredOptions[highlightedIndex];
          if (!option.disabled) {
            onSelect(option.id);
            setIsOpen(false);
            setSearch('');
            setHighlightedIndex(-1);
          }
        }
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    if (option.disabled) return;
    onSelect(option.id);
    setIsOpen(false);
    setSearch('');
    setHighlightedIndex(-1);
  };

  const defaultRenderOption = (option: Option, isSelected: boolean) => (
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className={`font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}>
            {option.label}
          </div>
          {option.badge && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
              {option.badge}
            </span>
          )}
        </div>
        {option.secondary && (
          <div className="text-sm truncate text-gray-600">
            {option.secondary}
          </div>
        )}
      </div>
      {showCount && option.count !== undefined && option.count > 0 && (
        <div className="ml-2 flex-shrink-0">
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
            {option.count}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          relative w-full rounded-xl border-2 border-gray-200 bg-white pl-4 pr-10 py-2.5 text-left shadow-sm 
          focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="block truncate text-gray-900">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-xl bg-white shadow-lg border-2 border-gray-200">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border-2 border-gray-200 pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-[#B5CED8] focus:outline-none focus:ring-2 focus:ring-[#B5CED8]/20"
              />
              <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {showCount && totalFilteredCount > 0 && (
                <div className="absolute right-2.5 top-2.5 text-xs text-gray-500">
                  {totalFilteredCount}
                </div>
              )}
            </div>
          </div>
          
          <div className="max-h-60 overflow-auto py-1">
            {totalFilteredCount === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {emptyMessage}
              </div>
            ) : (
              Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  {showGroups && groupOptions.length > 0 && (
                    <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                      {groupName}
                    </div>
                  )}
                  {groupOptions.map((option) => {
                    const optionIndex = filteredOptions.findIndex(o => o.id === option.id);
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleOptionClick(option)}
                        className={`
                          w-full text-left px-3 py-2 text-sm transition-colors
                          ${option.disabled 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'cursor-pointer hover:bg-gray-50'
                          }
                          ${highlightedIndex === optionIndex ? 'bg-[#B5CED8]/10' : ''}
                          ${value === option.id ? 'bg-[#B5CED8]/20' : ''}
                        `}
                        disabled={option.disabled}
                        onMouseEnter={() => setHighlightedIndex(optionIndex)}
                      >
                        {renderOption ? renderOption(option, value === option.id) : defaultRenderOption(option, value === option.id)}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}