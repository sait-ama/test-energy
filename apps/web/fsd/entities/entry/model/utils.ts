import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getPathname } from '@nimpl/getters/get-pathname';

import { entriesRetrieve } from '@re/api/generated/sdk.gen';
import { Entry } from '@re/api/generated/types.gen';

import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const resolveEntry = async () => {
  const pathname = getPathname();
  const dir = pathname?.split?.('/')?.at?.(-1);

  const config = getSiteConfig()!;
  const entries = Object.values(config.entries)
    .map((it) => Object.values(it))
    .flat();

  const entry = entries.find((entry) => entry.route === `/${dir}`);

  if (!entry) notFound();

  const data = await entriesRetrieve({
    path: { entry_id: entry.entryId },
    cache: 'force-cache',
    throwOnError: true,
    next: { revalidate: 60 * 60 },
  }).then((v) => v.data.content!);

  return {
    ...data,
    dir,
  };
};

export const getEntryMetadataValue = async (entry: Entry): Promise<Metadata> => {
  const siteConfig = getSiteConfig()!;
  const t = await getTranslations('pages.entry.meta');

  return generateNextMetadata({
    title: t('title', { title: entry.header }),
    description: t('description', {
      title: entry.header,
      description: entry.text.replace(htmlRegExp, ''),
      siteName: siteConfig.site.name,
    }),
    canonical: Routing.Entry.main({ params: { id: entry.id } }),
  });
};

export const getEntryCommonMetadata = fallbackDefaultMetadata(async () => {
  const entry = await resolveEntry();

  return getEntryMetadataValue(entry);
});
