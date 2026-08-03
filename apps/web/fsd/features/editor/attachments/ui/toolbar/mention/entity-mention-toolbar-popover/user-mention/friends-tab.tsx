import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { UserDetail } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';

import { useFriendsPaginatedListQuery } from '~entities/friend/model/queries';
import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { HorizontalUserCard } from '~entities/user/ui/horizontal-user-card';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ErrorView } from '~features/error-view';
import { useSession } from '~shared/lib/session/use-session';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { MentionContext, MentionContextSchema } from '../../../../../model/store';

const UserCard = ({ model, ...rest }: { model: UserDetail }) => {
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);

  const handleClick = async () => {
    handleSubmit(POST_ATTACHMENT_TYPE.user, String(model.id), model);
  };

  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md px-3 py-2"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <UserAvatar
          size="xs"
          withFrameMargin
          frameSrc={model?.frame?.high}
          avatarSrc={model?.avatar?.mid}
          alt="alt"
        />
        <ReText size="sm" lineClamp={1} className="break-all" weight="semibold">
          {model?.username}
        </ReText>
      </div>

      <ReText
        color="muted-foreground"
        size="sm"
        lineClamp={1}
        className="break-all"
        weight="medium"
      >
        @{model.id}
      </ReText>
    </div>
  );
};

const FriendsList = memo(() => {
  const session = useSession();

  const {
    data: pages,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendsPaginatedListQuery({
    variables: {
      params: { userId: session!.id },
      query: { count: 20, page: 1 },
    },
  });
  const friends = pages?.pages.flatMap((page) => page.results) || [];

  const FlatList: FlatListType<typeof friends> = _FlatList;
  const t = useTranslations('reusable.empty_states');
  return (
    <FlatList.Root className="w-full" content={friends} isLoading={isLoading || isFetchingNextPage}>
      <FlatList.Layout className="grid grid-cols-1 gap-2">
        <FlatList.Content>
          {({ item: item }) => <UserCard key={item.id} model={item} className="h-full w-full" />}
        </FlatList.Content>
        <FlatList.Loading count={10}>
          {({ key }) => <HorizontalUserCard isLoading model={null} key={key} />}
        </FlatList.Loading>
        <FlatList.Empty
          className="col-span-full opacity-70"
          height="40vh"
          isEmpty
          text={t('empty')}
          emoji="ඞ"
        />
        <FlatList.EdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
      </FlatList.Layout>
    </FlatList.Root>
  );
});

export const FriendsTab = memo(() => (
  <QueryErrorResetBoundary>
    <ErrorBoundary fallback={<ErrorView />}>
      <FriendsList />
    </ErrorBoundary>
  </QueryErrorResetBoundary>
));
