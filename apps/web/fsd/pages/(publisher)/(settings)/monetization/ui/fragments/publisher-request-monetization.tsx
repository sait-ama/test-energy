'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Coin from '@re/ui-kit/icons/coin';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';

import { Routing } from '~shared/config/routing';

export const PublisherRequestMonetization = (props: ButtonProps) => {
  const { dir } = useParams<{ dir: string }>();
  const t = useTranslations('publisher.actions.request-monetization.do');
  return (
    <Button size="sm" endIcon={<Coin />} className="flex items-center px-4" asChild {...props}>
      <Link
        shallow={false}
        className="text-primary"
        style={{ width: 'fit-content' }}
        prefetch={false}
        href={Routing.Publisher.settings({ params: { dir, tab: 'monetization' } })}
      >
        {t('trigger')}
      </Link>
    </Button>
  );
};
