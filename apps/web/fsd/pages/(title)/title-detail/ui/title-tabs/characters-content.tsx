'use client';

import type { ComponentPropsWithoutRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useCharacterByTitleListQuery } from '~entities/character/model/queries';
import { SquareCharacterCard } from '~entities/character/ui/square-character-card';
import { useTitleDetail } from '~entities/title/model/queries';
import { Routing } from '~shared/config/routing';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

export interface CharactersContentProps extends ComponentPropsWithoutRef<'div'> {}

export const CharactersContent = (props: CharactersContentProps) => {
  const { dir } = useParams<{ dir: string }>();
  const { data: title } = useTitleDetail({ variables: { params: { dir } } });
  const { data, isLoading } = useCharacterByTitleListQuery({
    variables: { params: { titleId: title!.id } },
  });

  const characters = data || [];

  const FlatList: FlatListType<typeof characters> = _FlatList;

  return (
    <FlatList.Root content={characters} isLoading={isLoading} {...props}>
      <FlatList.Container className="xs:grid-cols-3 grid grid-cols-2 gap-3 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4">
        <FlatList.Content>
          {({ item }) => (
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.Character.main({ params: { id: item.id } })}
              key={item.id}
            >
              <SquareCharacterCard model={item} withHover />
            </Link>
          )}
        </FlatList.Content>
        <FlatList.Loading count={20}>
          {({ key }) => <SquareCharacterCard isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" />
      </FlatList.Container>
    </FlatList.Root>
  );
};
