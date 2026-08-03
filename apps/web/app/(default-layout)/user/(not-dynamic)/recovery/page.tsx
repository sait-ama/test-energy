import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { PasswordRecovery } from 'fsd/widgets/auth/ui/forms/password-recovery';

import { Routing } from '~shared/config/routing';
import { getSiteConfig } from '~shared/config/site-config';
import { fallbackDefaultMetadata } from '~shared/lib/next/fallback-default-metadata';
import { withMetadataCache } from '~shared/lib/next/with-metadata-cache';
import { generateNextMetadata } from '~shared/seo/generate-next-metadata';

export const generateMetadata = fallbackDefaultMetadata(
  withMetadataCache(async () => {
    const t = await getTranslations('pages.user-recovery.meta');

    const siteConfig = getSiteConfig()!;

    return generateNextMetadata({
      title: t('title'),
      description: t('description', { siteName: siteConfig.site.name }),
      index: false,
      follow: false,
    });
  }, 'user-recovery')
);

export default async function RecoveryPage(props) {
  const searchParams = await props.searchParams;
  const { uid, token } = searchParams;

  if (!uid || !token || Array.isArray(uid) || Array.isArray(token)) {
    redirect(Routing.Home.main({ query: {} }));
  }

  return (
    <div className="border-border my-auto rounded-md border p-4">
      <PasswordRecovery uid={uid} token={token} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
