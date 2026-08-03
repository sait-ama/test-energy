import * as React from 'react';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { reV2TitlesMomentsRetrieveOptions } from '~entities/moment/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

import { Moment } from './_page';

export const generateMetadata = fallbackDefaultMetadata<{ dir: string }>(
  withMetadataCache(async (props) => {
    const params = await props.params;
    const siteConfig = getSiteConfig()!;
    const queryClient = getQueryClient();
    const t = await getTranslations(`pages.moment-item.meta.${siteConfig.contentType}`);

    const moment = await queryClient.fetchQuery(
      reV2TitlesMomentsRetrieveOptions({
        api: { path: { moment_dir: params.dir }, cache: 'no-cache' },
      })
    );

    return generateNextMetadata({
      title: t('title', {
        main_name: moment.title?.main_name,
      }),
      description: t('description', {
        main_name: moment.title?.main_name,
        description: (moment.description ?? '').replace(htmlRegExp, ''),
        siteName: siteConfig.site.name,
      }),
      canonical: Routing.Moment.detail({ params }),
      og: {
        alt: t('title', {
          main_name: moment.title?.main_name,
        }),
      },
    });
  }, 'moment-detailed')
);

export default async function MomentPage() {
  const siteConfig = getSiteConfig()!;

  if (!siteConfig.features[Features.SHORTS]) notFound();

  return (
    <Container slim className="flex flex-col gap-2">
      <Moment />
    </Container>
  );
}
