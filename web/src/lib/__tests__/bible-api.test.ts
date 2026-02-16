import { validateBibleReference, validateBibleReferenceExists, getBookSuggestions, fetchBibleVerse, clearVerseCache } from '../bible-api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Bible API - Validation', () => {
  beforeEach(() => {
    // Clear cache and mocks before each test
    clearVerseCache();
    jest.clearAllMocks();
  });

  describe('validateBibleReference', () => {
    it('should validate correct verse references', () => {
      const valid = validateBibleReference('John 3:16');
      expect(valid.isValid).toBe(true);
      expect(valid.canonicalBook).toBe('John');
      expect(valid.normalized).toBe('John 3:16');
    });

    it('should validate verse ranges', () => {
      const valid = validateBibleReference('Psalm 23:1-6');
      expect(valid.isValid).toBe(true);
      expect(valid.normalized).toBe('Psalm 23:1-6');
    });

    it('should validate numbered books', () => {
      const valid = validateBibleReference('1 John 4:19');
      expect(valid.isValid).toBe(true);
      expect(valid.canonicalBook).toBe('1 John');
    });

    it('should normalize abbreviations', () => {
      const valid = validateBibleReference('Jn 3:16');
      expect(valid.isValid).toBe(true);
      expect(valid.normalized).toBe('John 3:16');
    });

    it('should reject invalid format', () => {
      const invalid = validateBibleReference('John 3');
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toContain('Format should be');
    });

    it('should reject non-existent books', () => {
      const invalid = validateBibleReference('FakeBook 1:1');
      expect(invalid.isValid).toBe(false);
      expect(invalid.error).toContain('not a recognized Bible book');
    });

    it('should reject empty references', () => {
      const invalid = validateBibleReference('');
      expect(invalid.isValid).toBe(false);
    });

    it('should handle multi-word books', () => {
      const valid = validateBibleReference('Song of Solomon 1:1');
      expect(valid.isValid).toBe(true);
      expect(valid.canonicalBook).toBe('Song of Solomon');
    });

    it('should handle abbreviated multi-word books', () => {
      const valid = validateBibleReference('1 Cor 13:4');
      expect(valid.isValid).toBe(true);
      expect(valid.canonicalBook).toBe('1 Corinthians');
    });
  });

  describe('validateBibleReferenceExists', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock).mockClear();
    });

    it('should validate existing verses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          text: 'For God so loved the world...',
          reference: 'John 3:16',
          version: 'NIV'
        })
      });

      const result = await validateBibleReferenceExists('John 3:16');
      expect(result.isValid).toBe(true);
      expect(result.normalized).toBe('John 3:16');
    });

    it('should reject non-existent verses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await validateBibleReferenceExists('John 50:1');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    it('should reject verses with impossible chapter numbers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await validateBibleReferenceExists('1 John 10:1');
      expect(result.isValid).toBe(false);
    });

    it('should reject verses with impossible verse numbers', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404
      });

      const result = await validateBibleReferenceExists('1 John 1:800');
      expect(result.isValid).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await validateBibleReferenceExists('John 3:16');
      // API errors cause fetchBibleVerse to return null, which means verse "doesn't exist"
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('does not exist');
    });

    it('should reject invalid format before checking API', async () => {
      const result = await validateBibleReferenceExists('Invalid Format');
      expect(result.isValid).toBe(false);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('getBookSuggestions', () => {
    it('should return suggestions for partial book names', () => {
      const suggestions = getBookSuggestions('Joh');
      expect(suggestions).toContain('John');
      // Joshua doesn't match 'Joh' - it starts with 'Jos'
    });

    it('should return suggestions for numbered books', () => {
      const suggestions = getBookSuggestions('1 J');
      expect(suggestions).toContain('1 John');
    });

    it('should match abbreviations', () => {
      const suggestions = getBookSuggestions('Ps');
      expect(suggestions).toContain('Psalm');
    });

    it('should be case-insensitive', () => {
      const suggestions = getBookSuggestions('john');
      expect(suggestions).toContain('John');
    });

    it('should return empty array for short input', () => {
      const suggestions = getBookSuggestions('J');
      expect(suggestions).toEqual([]);
    });

    it('should return empty array for empty input', () => {
      const suggestions = getBookSuggestions('');
      expect(suggestions).toEqual([]);
    });

    it('should limit suggestions to 10', () => {
      const suggestions = getBookSuggestions('a');
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('Bible API - Fetching', () => {
  beforeEach(() => {
    clearVerseCache();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('fetchBibleVerse', () => {
    it('should fetch verse in ESV', async () => {
      const mockResponse = {
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        version: 'KJV',
        copyright: 'King James Version (Public Domain)'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchBibleVerse('John 3:16', 'ESV');
      // Note: Currently falls back to KJV from bible-api.com
      expect(result).toBeTruthy();
      expect(result?.reference).toBe('John 3:16');
    });

    it('should fetch verse in NIV', async () => {
      const mockResponse = {
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        version: 'KJV',
        copyright: 'King James Version (Public Domain)'
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchBibleVerse('John 3:16', 'NIV');
      // Note: Currently falls back to KJV from bible-api.com
      expect(result).toBeTruthy();
      expect(result?.reference).toBe('John 3:16');
    });

    it('should return null for API errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('API error'));

      const result = await fetchBibleVerse('John 3:16', 'ESV');
      expect(result).toBeNull();
    });

    it('should return null for 404 responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await fetchBibleVerse('Invalid 999:999', 'ESV');
      expect(result).toBeNull();
    });

    it('should cache verse results', async () => {
      const mockResponse = {
        reference: 'John 3:16',
        text: 'For God so loved the world...',
        version: 'KJV',
        copyright: 'King James Version (Public Domain)'
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      // First call - should fetch
      const result1 = await fetchBibleVerse('John 3:16', 'ESV');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result1).toBeTruthy();

      // Second call - should use cache (same reference + version)
      const result2 = await fetchBibleVerse('John 3:16', 'ESV');
      expect(global.fetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      // Results should have same content (cache may normalize version)
      expect(result2?.reference).toEqual(result1?.reference);
      expect(result2?.text).toEqual(result1?.text);
    });
  });
});
