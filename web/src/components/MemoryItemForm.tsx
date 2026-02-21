import { useState, useEffect } from 'react';
import { MemoryItem } from '@/lib/types';
import { validateBibleReference, getBookSuggestions } from '@/lib/bible-api';

interface MemoryItemFormProps {
  item?: MemoryItem | null;
  onSubmit: (data: Partial<MemoryItem>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  apiError?: string | null;
  onClearError?: () => void;
}

export default function MemoryItemForm({ 
  item = null, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  apiError = null,
  onClearError
}: MemoryItemFormProps) {
  const [formData, setFormData] = useState({
    type: 'verse' as 'verse' | 'custom',
    reference: '',
    text: '',
    points_first: 10,
    points_repeat: 5,
    active: true,
    bible_version: 'NIV',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fetchingVerse, setFetchingVerse] = useState(false);
  const [manualTextOverride, setManualTextOverride] = useState(false);
  const [bookSuggestions, setBookSuggestions] = useState<string[]>([]);
  const [validatingVerse, setValidatingVerse] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type,
        reference: item.reference,
        text: item.text || '',
        points_first: item.points_first,
        points_repeat: item.points_repeat,
        active: item.active,
        bible_version: item.bible_version || 'ESV',
      });
      // If editing an existing item with text, assume manual override
      if (item.text) {
        setManualTextOverride(true);
      }
    }
  }, [item]);

  // Clear form when API error indicates duplicate
  useEffect(() => {
    if (apiError && (apiError.toLowerCase().includes('duplicate') || apiError.toLowerCase().includes('already exists'))) {
      // Clear reference and text fields
      setFormData(prev => ({ ...prev, reference: '', text: '' }));
      setManualTextOverride(false);
      setErrors({});
    }
  }, [apiError]);

  // Auto-fetch verse when reference changes (for verse type only)
  useEffect(() => {
    if (formData.type === 'verse' && formData.reference && !manualTextOverride) {
      const delayDebounce = setTimeout(() => {
        const validation = validateBibleReference(formData.reference.trim());
        if (validation.isValid) {
          fetchVerseText();
        }
      }, 800); // Debounce to avoid too many API calls

      return () => clearTimeout(delayDebounce);
    }
  }, [formData.reference, formData.type, formData.bible_version]);

  const fetchVerseText = async () => {
    const reference = formData.reference.trim();
    if (!reference) return;

    // Validate reference format first
    const validation = validateBibleReference(reference);
    if (!validation.isValid) {
      return; // Don't fetch if invalid
    }

    setFetchingVerse(true);
    try {
      // Use our API route as a proxy to avoid CORS issues
      const params = new URLSearchParams({
        reference,
        version: formData.bible_version
      });
      const response = await fetch(`/api/bible/verse?${params}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setErrors(prev => ({ ...prev, reference: 'This verse reference does not exist' }));
        } else {
          setErrors(prev => ({ ...prev, reference: 'Failed to fetch verse. Please check the reference.' }));
        }
        return;
      }

      const verseData = await response.json();
      if (verseData && verseData.text) {
        handleInputChange('text', verseData.text);
        // Clear any previous errors
        setErrors(prev => ({ ...prev, reference: '', text: '' }));
      } else {
        setErrors(prev => ({ ...prev, reference: 'This verse reference does not exist or could not be fetched' }));
      }
    } catch (error) {
      console.error('Failed to fetch verse:', error);
      setErrors(prev => ({ ...prev, reference: 'Failed to fetch verse. Please check the reference.' }));
    } finally {
      setFetchingVerse(false);
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.reference.trim()) {
      newErrors.reference = 'Reference is required';
    } else if (formData.type === 'verse') {
      // Validate verse exists for verse type
      setValidatingVerse(true);
      try {
        const params = new URLSearchParams({
          reference: formData.reference.trim(),
          version: formData.bible_version
        });
        const response = await fetch(`/api/bible/verse?${params}`);
        setValidatingVerse(false);
        
        if (!response.ok) {
          if (response.status === 404) {
            newErrors.reference = 'This verse reference does not exist';
          } else {
            newErrors.reference = 'Failed to validate verse reference';
          }
        }
      } catch (error) {
        setValidatingVerse(false);
        newErrors.reference = 'Failed to validate verse reference';
      }
    }

    if (formData.points_first < 0) {
      newErrors.points_first = 'Points must be non-negative';
    }

    if (formData.points_repeat < 0) {
      newErrors.points_repeat = 'Points must be non-negative';
    }

    if (formData.type === 'verse' && formData.text.trim() && formData.text.length > 1000) {
      newErrors.text = 'Text must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    const submitData = {
      ...formData,
      text: formData.text.trim() || null,
      reference: formData.reference.trim(),
    };

    await onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: any) => {
    // Handle reference changes specially to consolidate state updates
    if (field === 'reference' && formData.type === 'verse') {
      // Reset manual override when reference changes to allow auto-fetch
      setManualTextOverride(false);
      setFormData(prev => ({ ...prev, reference: value, text: '' }));
      
      const bookMatch = value.match(/^([1-3]?\s?[A-Za-z\s]*)/);
      if (bookMatch && bookMatch[1].trim()) {
        const suggestions = getBookSuggestions(bookMatch[1].trim());
        setBookSuggestions(suggestions);
      } else {
        setBookSuggestions([]);
      }
    } else if (field === 'type' && value === 'verse') {
      // Reset manual override and clear text if switching to verse type
      setManualTextOverride(false);
      setFormData(prev => ({ ...prev, type: value, text: '' }));
    } else if (field === 'type' && value === 'custom') {
      // Reset manual override if switching to custom type
      setManualTextOverride(false);
      setFormData(prev => ({ ...prev, [field]: value }));
    } else if (field === 'text' && formData.type === 'verse' && typeof value === 'string' && !fetchingVerse) {
      // If manually editing text field for a verse, enable override
      // But NOT when it's being set by the auto-fetch
      setManualTextOverride(true);
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      // Default case: just update the field
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear API error when user makes changes
    if (onClearError) {
      onClearError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#B5CED8]/20 via-[#D1DA8A]/10 to-[#DFA574]/20">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'Edit Memory Item' : 'Add New Memory Item'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {item ? 'Update the memory item details below.' : 'Create a new memory item for students to memorize.'}
          </p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mb-6 rounded-2xl bg-[#C97435]/10 border border-[#C97435]/30 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start flex-1">
                <svg className="mr-2 h-5 w-5 text-[#C97435] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{apiError}</p>
                  {(apiError.toLowerCase().includes('duplicate') || apiError.toLowerCase().includes('already exists')) ? (
                    <p className="mt-1 text-xs text-gray-600">Please enter a different verse reference.</p>
                  ) : null}
                </div>
              </div>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="ml-3 flex-shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="space-y-2">
              <label className="flex items-start">
                <input
                  type="radio"
                  value="verse"
                  checked={formData.type === 'verse'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 mt-0.5"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">Bible Verse</div>
                  <div className="text-sm text-gray-600">For Scripture passages</div>
                </div>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  value="custom"
                  checked={formData.type === 'custom'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 mt-0.5"
                  disabled={isLoading}
                />
                <div>
                  <div className="font-medium text-gray-900">Books & More</div>
                  <div className="text-sm text-gray-600">For books of the Bible, catechisms, creeds, or other memory work</div>
                </div>
              </label>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">
              Reference / Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="reference"
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                onBlur={() => {
                  // Validate on blur for verses
                  if (formData.type === 'verse' && formData.reference) {
                    const validation = validateBibleReference(formData.reference);
                    if (!validation.isValid) {
                      setErrors(prev => ({ ...prev, reference: validation.error || 'Invalid reference' }));
                    }
                  }
                  // Delay hiding suggestions to allow clicking them
                  setTimeout(() => setBookSuggestions([]), 200);
                }}
                placeholder={formData.type === 'verse' ? 'e.g., John 3:16' : 'e.g., Books of the New Testament'}
                className={`mt-1 block w-full rounded-md border ${
                  errors.reference ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                disabled={isLoading}
              />
              
              {/* Autocomplete suggestions for Bible books */}
              {formData.type === 'verse' && bookSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                  {bookSuggestions.map((book) => (
                    <button
                      key={book}
                      type="button"
                      onClick={() => {
                        const current = formData.reference.trim();
                        const match = current.match(/^([1-3]?\s?[A-Za-z\s]*)(.*)/);
                        if (match) {
                          handleInputChange('reference', book + (match[2] ? ' ' + match[2].trim() : ' '));
                        } else {
                          handleInputChange('reference', book + ' ');
                        }
                        setBookSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors text-sm text-gray-900"
                    >
                      {book}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.reference && (
              <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
            )}
            {formData.type === 'verse' && fetchingVerse && (
              <p className="mt-1 text-sm text-blue-600 flex items-center">
                <svg className="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Fetching verse from Bible API...
              </p>
            )}
            {formData.type === 'verse' && !fetchingVerse && formData.text && !manualTextOverride && (
              <p className="mt-1 text-sm text-green-600">
                ✓ Verse text auto-fetched from {formData.bible_version}
              </p>
            )}
          </div>

          {/* Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                {formData.type === 'verse' 
                  ? `Text ${manualTextOverride ? '(Manual Override)' : '(Auto-fetched from API)'}` 
                  : 'Text / Description'}
              </label>
              <div className="flex items-center gap-2">
                {formData.type === 'verse' && !manualTextOverride && (
                  <select
                    value={formData.bible_version}
                    onChange={(e) => handleInputChange('bible_version', e.target.value)}
                    className="text-xs rounded border-gray-300 py-1 px-2"
                    disabled={isLoading}
                  >
                    <option value="ESV">ESV</option>
                    <option value="NIV">NIV</option>
                    <option value="KJV">KJV</option>
                    <option value="NKJV">NKJV</option>
                    <option value="NLT">NLT</option>
                    <option value="NASB">NASB</option>
                  </select>
                )}
                {formData.type === 'verse' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.reference.trim()) {
                          setErrors(prev => ({ ...prev, reference: 'Enter a reference first' }));
                          return;
                        }
                        const validation = validateBibleReference(formData.reference.trim());
                        if (!validation.isValid) {
                          setErrors(prev => ({ ...prev, reference: validation.error || 'Invalid reference' }));
                          return;
                        }
                        setManualTextOverride(false);
                        setFormData(prev => ({ ...prev, text: '' }));
                        fetchVerseText();
                      }}
                      disabled={isLoading || fetchingVerse}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {fetchingVerse ? '...' : '↻ Fetch'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setManualTextOverride(!manualTextOverride);
                        if (!manualTextOverride) {
                          // Switching to manual mode - keep current text
                        } else {
                          // Switching back to API mode - clear text to trigger fetch
                          setFormData(prev => ({ ...prev, text: '' }));
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {manualTextOverride ? '🤖 Auto' : '✎ Manual'}
                    </button>
                  </>
                )}
              </div>
            </div>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) => handleInputChange('text', e.target.value)}
              placeholder={
                formData.type === 'verse' 
                  ? (manualTextOverride ? 'Enter verse text manually (or use auto-fetch)' : 'Verse text will be automatically fetched from the Bible API')
                  : 'Description or instructions for this memory item'
              }
              rows={4}
              className={`mt-1 block w-full rounded-md border ${
                errors.text ? 'border-red-300' : 'border-gray-300'
              } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 ${
                formData.type === 'verse' && !manualTextOverride ? 'bg-gray-50' : ''
              }`}
              disabled={isLoading || (formData.type === 'verse' && !manualTextOverride)}
            />
            {errors.text && (
              <p className="mt-1 text-sm text-red-600">{errors.text}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.type === 'verse' && !manualTextOverride 
                ? 'Text is automatically fetched from the Bible API when you enter a valid reference'
                : `${formData.text.length}/1000 characters`}
            </p>
          </div>

          {/* Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="points_first" className="block text-sm font-medium text-gray-700">
                First Time Points *
              </label>
              <input
                type="number"
                id="points_first"
                value={formData.points_first}
                onChange={(e) => handleInputChange('points_first', parseInt(e.target.value) || 0)}
                min="0"
                className={`mt-1 block w-full rounded-md border ${
                  errors.points_first ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                disabled={isLoading}
              />
              {errors.points_first && (
                <p className="mt-1 text-sm text-red-600">{errors.points_first}</p>
              )}
            </div>

            <div>
              <label htmlFor="points_repeat" className="block text-sm font-medium text-gray-700">
                Repeat Points *
              </label>
              <input
                type="number"
                id="points_repeat"
                value={formData.points_repeat}
                onChange={(e) => handleInputChange('points_repeat', parseInt(e.target.value) || 0)}
                min="0"
                className={`mt-1 block w-full rounded-md border ${
                  errors.points_repeat ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500`}
                disabled={isLoading}
              />
              {errors.points_repeat && (
                <p className="mt-1 text-sm text-red-600">{errors.points_repeat}</p>
              )}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={isLoading}
            />
            <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
              Active (available for selection)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading || validatingVerse}
            >
              {validatingVerse ? 'Validating...' : (isLoading ? 'Saving...' : (item ? 'Update Item' : 'Create Item'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}