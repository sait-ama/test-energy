import { afterEach, describe, expect, it, vi } from 'vitest';

import { SiteConfig } from '~shared/config/constants';
import { DeepPartial } from '~shared/types/global';

import { generateNextMetadata } from './generate-next-metadata';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => `t(${key})`,
}));

vi.mock('~shared/config/site-config', () => ({
  getSiteConfig: () =>
    ({
      contentType: 'series',
      seo: { meta: { defaultImage: 'https://example.com/og.png' } },
      routing: { url: 'https://example.com' },
      site: { name: 'ReAnime' },
    }) satisfies DeepPartial<SiteConfig>,
}));

describe('generate-next-metadata', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('uses provided title/description and appends sitename', async () => {
    const meta = await generateNextMetadata({ title: 'Custom', description: 'Desc' });
    expect(meta.title).toBe('Custom — ReAnime');
    expect(meta.description).toBe('Desc');
    expect(meta.openGraph?.images?.[0]?.url).toBe('https://example.com/og.png');
  });

  it('builds canonical when provided', async () => {
    const meta = await generateNextMetadata({ title: 'Custom', canonical: '/path' });
    // @ts-expect-error next metadata typing
    expect(meta.alternates.canonical).toBe('https://example.com/path');
  });

  it('fills keywords and falls back to translations when not provided', async () => {
    const meta = await generateNextMetadata({ title: 'X' });
    expect(typeof meta.keywords).toBe('string');
  });
});
