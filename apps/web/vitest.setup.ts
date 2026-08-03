// import { cleanup } from '@testing-library/react';
// import { setupServer } from 'msw/node';
// import { afterAll, afterEach, beforeAll } from 'vitest';
//

import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';
import 'tsconfig-paths/register';

Object.defineProperty(HTMLElement.prototype, 'animate', {
  value: vi.fn(() => ({
    onfinish: null,
    cancel: vi.fn(),
    playState: 'running',
    finished: Promise.resolve(),
  })),
  writable: true,
});

Object.defineProperty(window, 'ResizeObserver', {
  value: vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true,
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: vi.fn((cb) => setTimeout(cb, 16)),
  writable: true,
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: vi.fn(),
  writable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

// const server = setupServer(...handlers);
//
// beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
//
// afterEach(() => {
//   cleanup();
//   server.resetHandlers();
// });
//
// afterAll(() => server.close());
