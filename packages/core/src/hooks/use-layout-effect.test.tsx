import * as React from 'react';

import { describe, expect, it } from 'vitest';

import { useLayoutEffect } from './use-layout-effect';

describe('useLayoutEffect', () => {
  it('returns React.useLayoutEffect if document exists', () => {
    expect(useLayoutEffect).toBe(React.useLayoutEffect);
  });

  it('returns noop if document does not exist', () => {
    const originalDocument = globalThis.document;
    // @ts-ignore
    delete globalThis.document;

    const { useLayoutEffect: imported } = require('./use-layout-effect');
    expect(imported).toBeTypeOf('function');
    // @ts-ignore
    globalThis.document = originalDocument;
  });
});
