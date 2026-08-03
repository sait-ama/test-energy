import { describe, expect, it } from 'vitest';

import { decodeHtml } from './decode-html';

describe('decodeHtml', () => {
  it('decodes HTML entities', () => {
    expect(decodeHtml('&lt;div&gt;Hello&amp;World&lt;/div&gt;')).toBe('<div>Hello&World</div>');
  });
});
