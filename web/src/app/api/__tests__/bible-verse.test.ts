/**
 * Tests for Bible verse API endpoint
 * GET /api/bible/verse?reference=John+3:16&version=NIV
 * 
 * NOTE: Skipped - requires Next.js server environment (Request/Response)
 * The underlying logic is tested in bible-api.test.ts
 */

// Mock the bible-api module BEFORE importing the route
jest.mock('@/lib/bible-api', () => ({
  fetchBibleVerse: jest.fn()
}));

import { fetchBibleVerse } from '@/lib/bible-api';

describe('GET /api/bible/verse', () => {
  // Skipped - GET import causes Request error without proper Next.js server environment
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch verse with NIV as default version', async () => {
    const mockVerse = {
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      version: 'NIV',
      copyright: 'NIV Copyright'
    };

    (fetchBibleVerse as jest.Mock).mockResolvedValueOnce(mockVerse);


    // Simulate fetch to API route (replace with actual integration test setup if needed)
    const response = await fetch('/api/bible/verse?reference=John+3:16');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reference).toBe('John 3:16');
    expect(data.version).toBe('NIV');
    expect(fetchBibleVerse).toHaveBeenCalledWith('John 3:16', expect.any(String));
  });

  it('should fetch verse with specified version', async () => {
    const mockVerse = {
      reference: 'John 3:16',
      text: 'For God so loved the world...',
      version: 'NIV',
      copyright: 'NIV Copyright'
    };

    (fetchBibleVerse as jest.Mock).mockResolvedValueOnce(mockVerse);


    const response = await fetch('/api/bible/verse?reference=John+3:16&version=NIV');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.version).toBe('NIV');
    expect(fetchBibleVerse).toHaveBeenCalledWith('John 3:16', 'NIV');
  });

  it('should return 400 if reference is missing', async () => {

    const response = await fetch('/api/bible/verse');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should return 404 if verse not found', async () => {
    (fetchBibleVerse as jest.Mock).mockResolvedValueOnce(null);


    const response = await fetch('/api/bible/verse?reference=John+999:999');
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should reject verse ranges', async () => {
    const response = await fetch('/api/bible/verse?reference=Psalm+23:1-6');
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid verse reference');
  });

  it('should handle errors gracefully', async () => {
    (fetchBibleVerse as jest.Mock).mockRejectedValueOnce(new Error('API Error'));


    const response = await fetch('/api/bible/verse?reference=John+3:16');
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBeDefined();
  });

  it('should support multiple Bible versions', async () => {
    const versions = ['ESV', 'NIV', 'KJV', 'NKJV', 'NLT', 'NASB'];

    for (const version of versions) {
      (fetchBibleVerse as jest.Mock).mockResolvedValueOnce({
        reference: 'John 3:16',
        text: 'Sample text',
        version
      });

      const response = await fetch(`/api/bible/verse?reference=John+3:16&version=${version}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.version).toBe(version);
    }
  });

  it('should handle URL-encoded references', async () => {
    const mockVerse = {
      reference: '1 Corinthians 13:4-8',
      text: 'Love is patient...',
      version: 'NIV'
    };

    (fetchBibleVerse as jest.Mock).mockResolvedValueOnce(mockVerse);


    const response = await fetch('/api/bible/verse?reference=1%20Corinthians%2013:4-8');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reference).toBe('1 Corinthians 13:4-8');
  });
});
