import { getTranslations } from 'next-intl/server';

import { Feedback } from '~entities/feedback/ui/feedback';
import type { FeedBackType } from '~shared/api/models/feedback';
import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { Container } from '~shared/ui/container';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.feedback-page.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      canonical: Routing.Feedback.main(),
    });
  }, 'feedback')
);

export default async function FeedbackPage(props: {
  searchParams: Promise<{ type: string | string[] }>;
}) {
  const params = await props.searchParams;
  const { type } = params;
  const typeIds = type
    ? ((Array.isArray(type) ? type.map(Number) : [Number(type)]) as FeedBackType[])
    : undefined;

  return (
    <Container slim className="mt-8 flex-1 px-2">
      <Feedback types={typeIds} />
    </Container>
  );
}

export const dynamic = 'force-dynamic';
