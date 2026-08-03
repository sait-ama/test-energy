import { getTranslations } from 'next-intl/server';

import { TitleChaptersList } from '~pages/(title)/edit-title/title-chapters-list';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const siteConfig = getSiteConfig()!;

    const t = await getTranslations(`pages.edit-chapters-page.meta.${siteConfig.contentType}`);

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'title-chapters-edit')
);

export default async function EditChapters() {
  // // TODO: TS
  // if (!data?.meta?.can_upload_chapters) {
  //     redirect(Routing.Home.main({ query: {} }));
  // }

  return <TitleChaptersList />;
}

export const dynamic = 'force-dynamic';
