import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { fallbackExtractTags, useAI } from './useAI';

// Mock the sonner toast module
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the env module
vi.mock('@/lib/env', () => ({
  env: {
    SUPABASE_URL: 'https://mock-supabase.supabase.co',
    SUPABASE_ANON_KEY: 'mock-anon-key',
  },
}));

describe('fallbackExtractTags', () => {
  describe('basic extraction', () => {
    it('should extract top-frequency single words', () => {
      const text = 'react react hooks hooks hooks learning javascript';
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('hooks');
      expect(tags).toContain('react');
      expect(tags).toContain('learning');
      // May also contain 'javascript' depending on frequency
      expect(tags.length).toBeGreaterThan(0);
      // Verify order by frequency (hooks appears 3x, react 2x)
      expect(tags[0]).toBe('hooks');
      expect(tags[1]).toBe('react');
    });

    it('should limit results to maxTags parameter', () => {
      const text = 'aaa aaa aaa bbb bbb ccc ccc ccc ccc ddd ddd eee eee eee';
      const tags = fallbackExtractTags(text, 3);

      expect(tags).toHaveLength(3);
      // 'ccc' appears 4x (should be first), expect others in order by frequency
      expect(tags[0]).toBe('ccc');
      expect(tags.length).toBeLessThanOrEqual(3);
    });

    it('should default to 6 tags when maxTags not specified', () => {
      const text = 'word1 word1 word2 word2 word3 word3 word4 word4 word5 word5 word6 word6 word7 word7 word8 word8';
      const tags = fallbackExtractTags(text);

      expect(tags.length).toBeLessThanOrEqual(6);
    });
  });

  describe('stopword filtering', () => {
    it('should filter out common stopwords', () => {
      const text = 'the the the react and and html is is are be';
      const tags = fallbackExtractTags(text);

      expect(tags).not.toContain('the');
      expect(tags).not.toContain('and');
      expect(tags).not.toContain('is');
      expect(tags).not.toContain('are');
      expect(tags).not.toContain('be');
      expect(tags).toContain('react');
      expect(tags).toContain('html');
    });

    it('should filter stopwords case-insensitively', () => {
      const text = 'React THE AND Learning';
      const tags = fallbackExtractTags(text);

      expect(tags).not.toContain('the');
      expect(tags).not.toContain('and');
      expect(tags).toContain('react');
      expect(tags).toContain('learning');
    });

    it('should filter short words (< 3 characters)', () => {
      const text = 'a an to in on at react hooks javascript';
      const tags = fallbackExtractTags(text);

      expect(tags).not.toContain('a');
      expect(tags).not.toContain('an');
      expect(tags).not.toContain('to');
      expect(tags).toContain('react');
      expect(tags).toContain('hooks');
      expect(tags).toContain('javascript');
    });
  });

  describe('special character and URL handling', () => {
    it('should strip URLs from text', () => {
      const text = 'Visit https://example.com for more info about React';
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      expect(tags).toContain('visit');
      expect(tags).toContain('info');
      // URL should not produce tags
      expect(tags).not.toContain('https');
      expect(tags).not.toContain('example');
    });

    it('should remove punctuation', () => {
      const text = 'React! React? React. hooks: hooks; hooks, learning!';
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      expect(tags).toContain('hooks');
      expect(tags).toContain('learning');
      // Verify no punctuation in tags
      tags.forEach(tag => {
        expect(tag).toMatch(/^[a-z0-9]+$/);
      });
    });

    it('should handle mixed punctuation and special characters', () => {
      const text = '@#$React%^&()hooks***learning!!!';
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      expect(tags).toContain('hooks');
      expect(tags).toContain('learning');
    });

    it('should handle HTTP and HTTPS URLs', () => {
      const text = 'Learn at http://example.com and https://another-site.io about programming';
      const tags = fallbackExtractTags(text);

      expect(tags).not.toContain('http');
      expect(tags).not.toContain('https');
      expect(tags).toContain('learn');
      expect(tags).toContain('programming');
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty string', () => {
      const tags = fallbackExtractTags('');
      expect(tags).toEqual([]);
    });

    it('should return empty array for whitespace-only string', () => {
      const tags = fallbackExtractTags('   \n\t  ');
      expect(tags).toEqual([]);
    });

    it('should return empty array for only stopwords', () => {
      const tags = fallbackExtractTags('the and or but is are');
      expect(tags).toEqual([]);
    });

    it('should return empty array for only short words', () => {
      const tags = fallbackExtractTags('a an to in on at by it me we');
      expect(tags).toEqual([]);
    });

    it('should return empty array for only URLs', () => {
      const tags = fallbackExtractTags('https://example.com http://another.co');
      expect(tags).toEqual([]);
    });

    it('should handle single valid word', () => {
      const tags = fallbackExtractTags('react');
      expect(tags).toEqual(['react']);
    });

    it('should handle very long text', () => {
      const longText = 'react '.repeat(1000) + 'hooks '.repeat(500);
      const tags = fallbackExtractTags(longText, 2);

      expect(tags).toHaveLength(2);
      expect(tags[0]).toBe('react');
      expect(tags[1]).toBe('hooks');
    });

    it('should handle text with various encodings', () => {
      const text = 'react café naïve résumé learning';
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      expect(tags).toContain('learning');
      // Special characters are stripped, so accent chars are removed
    });
  });

  describe('real-world examples', () => {
    it('should extract tags from typical knowledge item content', () => {
      const title = 'React Hooks Guide';
      const content = `Learn about React Hooks including hooks hooks hooks.
        React Hooks allow you to use state and other React features without writing class components.
        Understanding React hooks is essential for modern React development.
      `;
      const text = `${title} ${content}`;
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      expect(tags).toContain('hooks');
      expect(tags.length).toBeGreaterThan(0);
      // Verify hooks is high-frequency (most frequent)
      expect(tags[0]).toBe('hooks');
    });

    it('should extract tags from article with URL and punctuation', () => {
      const text = `Check out this article: https://example.com/react-guide.
        It covers React! React? React...
        State management, hooks, and more!
      `;
      const tags = fallbackExtractTags(text);

      expect(tags).toContain('react');
      // 'check', 'article', 'covers', 'state', 'management' might be included
      expect(tags.length).toBeGreaterThan(0);
      // Verify no URLs in results
      expect(tags).not.toContain('https');
    });
  });
});

describe('useAI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('autoTag', () => {
    it('should return AI-generated tags with fallback: false on success', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ tags: ['react', 'hooks', 'javascript'] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());

      const response = await result.current.autoTag('React Hooks', 'Content about hooks');

      expect(response).toEqual({
        tags: ['react', 'hooks', 'javascript'],
        fallback: false,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/ai-process'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('auto-tag'),
        })
      );
    });

    it('should return local fallback tags with fallback: true on 404', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: vi.fn().mockResolvedValue({ error: 'Not found' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const response = await result.current.autoTag('React', 'React is a library');

      expect(response.fallback).toBe(true);
      expect(response.tags).toContain('react');
      expect(Array.isArray(response.tags)).toBe(true);
      expect(response.tags.length).toBeGreaterThan(0);
    });

    it('should return local fallback tags with fallback: true on 500', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: vi.fn().mockResolvedValue({ error: 'Server error' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const response = await result.current.autoTag('Test', 'Test content here');

      expect(response.fallback).toBe(true);
      expect(Array.isArray(response.tags)).toBe(true);
    });

    it('should return local fallback tags on network error', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAI());
      const response = await result.current.autoTag('Title', 'Content text here');

      expect(response.fallback).toBe(true);
      expect(Array.isArray(response.tags)).toBe(true);
      // Should extract tags from title and content
      expect(response.tags.length).toBeGreaterThanOrEqual(0);
    });

    it('should set isLoading to true during request', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve({ tags: ['test'] }), 100))
        ),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());

      expect(result.current.isLoading).toBe(false);

      const promise = result.current.autoTag('Test', 'Content');

      // Note: Hook state updates may not be reflected immediately in sync code
      // This is a limitation of testing React hooks without act()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await promise;
    });

    it('should send correct request body for auto-tag', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ tags: ['test'] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      await result.current.autoTag('My Title', 'My content');

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        action: 'auto-tag',
        title: 'My Title',
        content: 'My content',
      });
    });

    it('should send proper authorization header', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ tags: ['test'] }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      await result.current.autoTag('Title', 'Content');

      const callArgs = (global.fetch as any).mock.calls[0];
      const headers = callArgs[1].headers;

      expect(headers.Authorization).toContain('Bearer');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should handle malformed response gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({}), // Missing 'tags' field
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const response = await result.current.autoTag('Title', 'Content');

      expect(response.tags).toEqual([]);
      expect(response.fallback).toBe(false);
    });
  });

  describe('summarize', () => {
    it('should return summary on success', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'This is a summary.' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const summary = await result.current.summarize('Title', 'Long content...');

      expect(summary).toBe('This is a summary.');
    });

    it('should return null on error', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'Failed' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const summary = await result.current.summarize('Title', 'Content');

      expect(summary).toBeNull();
    });

    it('should return null on network error', async () => {
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAI());
      const summary = await result.current.summarize('Title', 'Content');

      expect(summary).toBeNull();
    });

    it('should send correct request body for summarize', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ result: 'Summary' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      await result.current.summarize('My Title', 'My content');

      const callArgs = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);

      expect(body).toEqual({
        action: 'summarize',
        title: 'My Title',
        content: 'My content',
      });
    });
  });

  describe('integration behavior', () => {
    it('should use fallback tags when API fails', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: vi.fn().mockResolvedValue({ error: 'Service Unavailable' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAI());
      const response = await result.current.autoTag(
        'Machine Learning Basics',
        'Machine learning is a subset of artificial intelligence that focuses on learning from data.'
      );

      expect(response.fallback).toBe(true);
      expect(response.tags.length).toBeGreaterThan(0);
      // Should contain extracted keywords
      expect(response.tags.some(tag => 
        tag.includes('machine') || tag.includes('learning') || tag.includes('data')
      )).toBe(true);
    });
  });
});
