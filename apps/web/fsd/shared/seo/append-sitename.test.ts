import { afterEach, describe, expect, it, vi } from 'vitest';

import { SiteConfig, SiteNames } from '~shared/config/constants';
import { DeepPartial } from '~shared/types/global';

import { appendSitename } from './append-sitename';

vi.mock('~shared/config/site-config', () => {
  return {
    getSiteConfig: () => ({ site: { name: SiteNames.ReAnime } }) satisfies DeepPartial<SiteConfig>,
  };
});

describe('append-sitename', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('appends sitename to the string', () => {
    expect(appendSitename('Hello')).toBe('Hello — ReAnime');
  });
});
