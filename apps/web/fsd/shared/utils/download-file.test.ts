import { describe, expect, it, vi } from 'vitest';

import { downloadFile } from './download-file';

describe('downloadFile', () => {
  it('creates hidden anchor and clicks it', () => {
    const clickMock = vi.fn();
    const appendMock = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => null as unknown as Node);
    const removeMock = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => null as unknown as Node);
    const createEl = vi.spyOn(document, 'createElement');

    const mockElement = {
      href: '',
      style: { display: '' },
      setAttribute: vi.fn(),
      click: clickMock,
      nodeType: 1, // Element node
      nodeName: 'A',
    };

    createEl.mockReturnValue(mockElement as unknown as HTMLAnchorElement);

    downloadFile('https://example.com/file');

    expect(clickMock).toHaveBeenCalled();
    expect(appendMock).toHaveBeenCalledWith(mockElement);
    expect(removeMock).toHaveBeenCalledWith(mockElement);

    createEl.mockRestore();
    appendMock.mockRestore();
    removeMock.mockRestore();
  });
});
