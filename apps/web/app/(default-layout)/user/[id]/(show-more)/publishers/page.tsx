import { getTranslations } from 'next-intl/server';

import { UserRepository } from '~entities/user/model/repository';
import { Publishers } from '~pages/(user)/publishers/ui/publishers';
import { Routing } from '~shared/config/routing';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata<{ id: string }>(
  withMetadataCache(async (props) => {
    const { id } = await props.params;
    const t = await getTranslations('user.pages.publishers.meta');

    const user = await UserRepository.userById({ params: { userId: id } }, { cache: 'no-cache' });

    const username = user.username;

    const title = t('title', { username });

    return generateNextMetadata({
      title,
      description: t('description', { username }),
      canonical: Routing.User.detail({ params: { id, tab: 'publishers' } }),
    });
  }, 'user-publishers')
);

export default async function PublishersPage(props) {
  const params = await props.params;
  const { id } = params;
  const user = await UserRepository.userById({ params: { userId: id } }); // todo: remove? "how to pass props from layout to PAGES" - никак?

  return <Publishers user={user} />;
}

export const dynamic = 'force-dynamic';
