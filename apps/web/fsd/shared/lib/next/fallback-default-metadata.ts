import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import type { NextPageParams } from '~shared/types/next';

export const fallbackDefaultMetadata = <
  Params extends Record<string, string | string[] | undefined> | null,
  SearchParams extends Record<string, string | string[] | undefined> | null | undefined = undefined,
>(
  generateMetadata: (params: NextPageParams<Params, SearchParams>) => Promise<Metadata>
) => {
  return (params: NextPageParams<Params, SearchParams>) =>
    generateMetadata(params).catch(async (e: unknown) => {
      const domainConfig = getSiteConfig()!;
      const t = await getTranslations(`pages.home.meta.${domainConfig.contentType}`);
      return generateNextMetadata({
        title: t('title'),
        description: t('description', { siteName: domainConfig.site.name }),
      });
    });
};
