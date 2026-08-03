import { memo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { useTranslations } from 'use-intl';

import { PublisherDetail } from '@re/api/generated/types.gen';
import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { ReText } from '@re/ui-kit/ui/text';

import { POST_ATTACHMENT_TYPE } from '~entities/post-attachment/model/const';
import { ErrorView } from '~features/error-view';
import { useSession } from '~shared/lib/session/use-session';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { useStrictContext } from '~shared/utils/use-strict-context';

import { MentionContext, MentionContextSchema } from '../../../../../model/store';

const PublisherCard = ({ model }: { model: PublisherDetail }) => {
  const { handleSubmit } = useStrictContext<MentionContextSchema>(MentionContext);

  const handleClick = async () => {
    handleSubmit(POST_ATTACHMENT_TYPE.publisher, model.id, model);
  };

  return (
    <div
      className="hover:bg-muted flex cursor-pointer items-center justify-between rounded-md px-3 py-2"
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        <Avatar
          src={UrlFormatter.media(model?.cover?.mid || '')}
          className="aspect-square overflow-hidden rounded-sm select-none"
          style={{ width: 40, height: 40 }}
        >
          <AvatarImage alt={model?.name || ''} width={40} height={40} className="rounded-sm" />
          <AvatarFallback>{model?.name}</AvatarFallback>
        </Avatar>
        <ReText size="sm" lineClamp={1} className="break-all" weight="semibold">
          {model.name}
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

const UserPublishersList = memo(() => {
  const session = useSession();
  const t = useTranslations('reusable.empty_states');
  const friends = session?.publishers ?? [];

  const FlatList: FlatListType<typeof friends> = _FlatList;

  return (
    <FlatList.Root className="w-full" content={friends}>
      <FlatList.Layout className="grid grid-cols-1 gap-2">
        <FlatList.Content>
          {({ item: item }) => (
            <PublisherCard key={item.id} model={item} className="h-full w-full" />
          )}
        </FlatList.Content>
        <FlatList.Empty
          className="col-span-full opacity-70"
          height="40vh"
          isEmpty
          text={t('empty')}
          emoji="ඞ"
        />
      </FlatList.Layout>
    </FlatList.Root>
  );
});

export const UserPublishersTab = memo(() => (
  <QueryErrorResetBoundary>
    <ErrorBoundary fallback={<ErrorView />}>
      <UserPublishersList />
    </ErrorBoundary>
  </QueryErrorResetBoundary>
));
