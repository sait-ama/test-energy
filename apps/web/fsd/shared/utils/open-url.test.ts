import { describe, expect, it, vi } from 'vitest';

import { openUrl } from './open-url';

describe('openUrl', () => {
  it('creates anchor and clicks it', () => {
    const clickMock = vi.fn();
    const createEl = vi.spyOn(document, 'createElement');
    createEl.mockReturnValue({
      click: clickMock,
      set href(_v: string) {},
      set target(_v: string) {},
    } as any);

    openUrl('https://example.com');

    expect(clickMock).toHaveBeenCalled();
    createEl.mockRestore();
  });
});
