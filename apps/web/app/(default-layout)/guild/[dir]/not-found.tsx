'use client';
import { useTranslations } from 'next-intl';

import { Error404 } from '~features/error-view/ui/error-404';
import { Container } from '~shared/ui/container';

export default function NotFound() {
  const t = useTranslations('pages.guild.errors.404');
  return (
    <Container className="flex h-screen items-center justify-center">
      <Error404 text={t('heading')} />
    </Container>
  );
}
