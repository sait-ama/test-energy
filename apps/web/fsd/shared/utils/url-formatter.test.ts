import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UrlBuilder, UrlFormatter } from './url-formatter';

describe('UrlFormatter', () => {
  beforeEach(() => {
    vi.mock('./env', () => ({
      publicEnv: (key: string) => {
        if (key === 'MEDIA_URL') return 'https://media.example.com';
        return '';
      },
    }));

    vi.mock('~shared/config/site-config', () => ({
      getSiteConfig: () => ({
        routing: {
          url: 'https://example.com',
        },
      }),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createUrl', () => {
    it('joins parts with slashes', () => {
      expect(UrlFormatter.createUrl('a', 'b', 'c')).toBe('a/b/c');
    });

    it('removes duplicate slashes', () => {
      expect(UrlFormatter.createUrl('a/', '/b/', '/c')).toBe('a/b/c');
    });

    it('filters out falsy values', () => {
      expect(UrlFormatter.createUrl('a', undefined, 'b', null, 'c')).toBe('a/b/c');
    });
  });

  describe('addQuery', () => {
    it('adds query parameters', () => {
      expect(UrlFormatter.addQuery('/path', { a: 1, b: 'test' })).toBe('/path?a=1&b=test');
    });

    it('handles empty query params', () => {
      expect(UrlFormatter.addQuery('/path', {})).toBe('/path');
    });

    it('removes null and undefined values', () => {
      expect(UrlFormatter.addQuery('/path', { a: 1, c: undefined })).toBe('/path?a=1');
    });
  });

  describe('media', () => {
    it('handles null/empty input', () => {
      expect(UrlFormatter.media(null)).toBe('');
      expect(UrlFormatter.media('')).toBe('');
    });

    it('returns StaticImport as is', () => {
      const staticImport = { src: 'test.jpg', height: 100, width: 100 };
      expect(UrlFormatter.media(staticImport)).toBe(staticImport);
    });

    it('returns data URLs as is', () => {
      const dataUrl = 'data:image/png;base64,xyz';
      expect(UrlFormatter.media(dataUrl)).toBe(dataUrl);
    });

    it('returns full URLs as is', () => {
      expect(UrlFormatter.media('https://other.com/image.jpg')).toBe('https://other.com/image.jpg');
    });

    it('prepends media URL to relative paths', () => {
      expect(UrlFormatter.media('image.jpg')).toBe('https://media.example.com/media/image.jpg');
    });
  });

  describe('fromMedia', () => {
    it('extracts path from full media URL', () => {
      expect(UrlFormatter.fromMedia('https://media.example.com/media/image.jpg')).toBe('image.jpg');
    });

    it('extracts path from partial media URL', () => {
      expect(UrlFormatter.fromMedia('/media/image.jpg')).toBe('image.jpg');
    });

    it('handles URLs without media prefix', () => {
      expect(UrlFormatter.fromMedia('image.jpg')).toBe('image.jpg');
    });

    it('removes leading slashes', () => {
      expect(UrlFormatter.fromMedia('///image.jpg')).toBe('image.jpg');
    });
  });
});

describe('UrlBuilder', () => {
  it('builds URLs incrementally', () => {
    const url = new UrlBuilder('base').add('path').add('subpath').query({ param: 'value' }).build();

    expect(url).toBe('base/path/subpath/?param=value');
  });

  it('handles multiple query parameters', () => {
    const url = new UrlBuilder('base').query({ a: 1 }).query({ b: 2 }).build();

    expect(url).toBe('base?a=1&b=2');
  });

  it('filters out undefined parts in constructor', () => {
    const url = new UrlBuilder('base', undefined, 'path').build();
    expect(url).toBe('base/path');
  });
});
