import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { ReText } from '@re/ui-kit/ui/text';

import { getTitlesListInfiniteKey } from '~entities/title/model/queries';
import { getQueryClient } from '~shared/api/react-query';
import { Container } from '~shared/ui/container';
import { Underline } from '~shared/ui/underline';

export default async function HotUpdatesLayout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  await queryClient.prefetchInfiniteQuery(
    getTitlesListInfiniteKey({ variables: { query: { count: 20, slider: 'hot_new' } } })
  );

  return (
    <Container layout="extraslim" className="space-y-4 py-4">
      <div className="mb-1 flex flex-col justify-center px-4 pt-8 pb-12">
        <Underline className="self-center">
          <ReText size="2xl" weight="bold">
            Горячие новинки
          </ReText>
        </Underline>
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
    </Container>
  );
}
