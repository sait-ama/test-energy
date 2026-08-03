'use client';

import { useParams } from 'next/navigation';

import {
  useSimilarTitlesSuspenseInfinite,
  useSuspenseTitleDetail,
} from '~entities/title/model/queries';
import { ActionButton, HorizontalSimilarCard } from '~entities/title/ui/horizontal-similar-card';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import type { SimilarTitle } from '~shared/api/models/title';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Section, SectionTitle } from '~shared/ui/section';

export const SimilarPage = () => {
  const params = useParams<{ dir: string }>();

  const { data: title } = useSuspenseTitleDetail({ variables: { params } });

  const {
    data: similar,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSimilarTitlesSuspenseInfinite({ variables: { params } });

  const FlatList: FlatListType<SimilarTitle[]> = _FlatList;
  return (
    <FlatList.Root
      content={similar?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetchingNextPage}
      className="my-4 space-y-4"
    >
      <HorizontalTitleCard model={title!} />
      <Section>
        <SectionTitle>Похожие</SectionTitle>
        <FlatList.Layout layout="list">
          <FlatList.Content>
            {({ item }) => (
              <HorizontalSimilarCard
                key={item.id}
                renderAction={({ similarDir, type, rated }) => (
                  <ActionButton
                    type={type}
                    titleDir={params.dir}
                    similarDir={similarDir}
                    rated={rated}
                  />
                )}
                model={item}
              />
            )}
          </FlatList.Content>
          <FlatList.Loading count={4}>
            {({ key }) => <HorizontalSimilarCard isLoading model={{} as SimilarTitle} key={key} />}
          </FlatList.Loading>
          <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
        </FlatList.Layout>
        <FlatList.Empty className="col-span-2" text="Пусто" emoji="🎴" />
      </Section>
    </FlatList.Root>
  );
};
