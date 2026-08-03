import { unauthorized } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { getSession } from '~shared/lib/session/get-session';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';
import { CreateCharacterForm } from '~widgets/create-character/ui/create-character-form';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.character-add-page.meta');
    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'character-add')
);

export default async function CharacterAdd() {
  const session = await getSession();

  if (!session) unauthorized();

  return <CreateCharacterForm />;
}

export const dynamic = 'force-dynamic';
