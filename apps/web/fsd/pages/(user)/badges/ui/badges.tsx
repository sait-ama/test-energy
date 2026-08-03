'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import ArrowIcon from '@re/ui-kit/icons/arrow-left';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';

import { useUserBadges } from '~entities/user/model/queries';
import { BadgeWithModal } from '~entities/user/ui/badge-card';
import { Routing } from '~shared/config/routing';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { FlatListType } from '~shared/ui/flat-list-v2';
import { Underline } from '~shared/ui/underline';

export const BadgesList = () => {
  const { id } = useParams<{ id: string }>();
  const { data, fetchNextPage, isFetchingNextPage } = useUserBadges({
    variables: { params: { userId: id } },
  });
  const badges = data?.pages.flatMap((it) => it.results) || [];
  const FlatList: FlatListType<typeof badges> = _FlatList;

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Button variant="outline" asChild startIcon={<ArrowIcon />}>
          <Link
            shallow={false}
            prefetch={false}
            href={Routing.User.detail({ params: { id, tab: 'about' } })}
          >
            Назад
          </Link>
        </Button>
      </div>
      <Underline>
        <ReText size="2xl" component="h2">
          Бейджи
        </ReText>
      </Underline>
      <FlatList.Root
        content={badges}
        isFetchingNextPage={isFetchingNextPage}
        className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8"
      >
        <FlatList.Content>
          {({ item }) => (
            <BadgeWithModal
              model={item}
              key={item.id}
              className="border-border rounded-sm border p-3"
            />
          )}
        </FlatList.Content>
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={!isFetchingNextPage} />
      </FlatList.Root>
    </div>
  );
};
