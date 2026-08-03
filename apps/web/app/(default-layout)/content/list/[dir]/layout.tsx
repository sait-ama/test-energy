import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { captureException } from '@sentry/nextjs';

import { getTitleSliderInfiniteKey } from '~entities/title/model/queries';
import { ErrorView } from '~features/error-view';
import { getQueryClient } from '~shared/api/react-query';
import { getError } from '~shared/lib/form/error-handling-base';
import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';

export default async function TitlesListLayout(props: {
  children: React.ReactNode;
  params: Promise<{ dir: string }>;
}) {
  const [t, { dir }] = await Promise.all([
    getTranslations('reusable.errors.default'),
    props.params,
  ]);
  const { children } = props;

  const queryClient = getQueryClient();
  const { response, error } = await queryClient
    .fetchInfiniteQuery(
      getTitleSliderInfiniteKey({
        variables: {
          params: { dir },
          query: {},
        },
      })
    )
    .then((v) => ({ response: v, error: null }))
    .catch((e: unknown) => {
      captureException(e);
      const error = getError(e as Error);
      return { error, response: null };
    });
  return (
    <Container layout="extraslim" className="space-y-4 py-8">
      {!error && (
        <>
          <div className="flex justify-center px-4 py-4 max-md:flex-col">
            <Underline>
              <ReText size="3xl" weight="bold">
                {response?.pages[0]?.name}
              </ReText>
            </Underline>
          </div>
          {children}
        </>
      )}
      {error && (
        <ErrorView
          withImage
          actions={
            <Link shallow={false} prefetch={false} href="/">
              <Button>{t('linking')}</Button>
            </Link>
          }
          msg={error.message}
          status={error.statusCode}
          className="flex min-h-screen items-center justify-center"
        />
      )}
    </Container>
  );
}
