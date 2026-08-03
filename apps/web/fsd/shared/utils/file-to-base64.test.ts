import { describe, expect, it } from 'vitest';

import { fileToBase64 } from './file-to-base64';

describe('fileToBase64', () => {
  it('converts file to base64 using FileReader', async () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const file = new File([blob], 'hello.txt', { type: 'text/plain' });

    const result = await fileToBase64(file);
    expect(result.startsWith('data:text/plain;base64,')).toBe(true);
  });
});
