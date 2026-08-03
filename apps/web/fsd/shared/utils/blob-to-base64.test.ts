import { afterEach, describe, expect, it, vi } from 'vitest';

import { blobToBase64, url2Base64 } from './blob-to-base64';

describe('blob-to-base64', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  it('converts blob to base64', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const base64 = await blobToBase64(blob);
    expect(base64.startsWith('data:text/plain;base64,')).toBe(true);
  });

  it('converts url to base64 by fetching and reading blob', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async () => blob }) as any)
    );
    const base64 = await url2Base64('https://example.com/blob');
    expect(base64.startsWith('data:text/plain;base64,')).toBe(true);
  });
});
