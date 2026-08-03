import React from 'react';
import Image from 'next/image';
import { useFormatter, useNow } from 'next-intl';

import { cn } from '@re/ui-kit/utils/cn';

import { actions, FriendShipActionsProvider } from '~entities/friend/model/friend-actions-context';
import { FriendCardActionsMenu } from '~entities/friend/ui/friend-card-actions-menu';
import {
  HorizontalUserCard,
  HorizontalUserCardProps,
} from '~entities/user/ui/horizontal-user-card';
import type { FriendShipSchema } from '~shared/api/models/friend';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface FriendCardProps<T extends FriendShipSchema> extends HorizontalUserCardProps<T> {}

export const HorizontalFriendCard = <T extends FriendShipSchema>(props: FriendCardProps<T>) => {
  const { model, className, ...rest } = props;
  const formatter = useFormatter();
  const now = useNow();

  const dateString = model?.created_at
    ? formatter
        .relativeTime(new Date(model.created_at).getTime(), now)
        .split(' ')
        .slice(0, 2)
        .join(' ')
    : null;

  return (
    <FriendShipActionsProvider value={{ actions, friendId: model?.id! }}>
      <HorizontalUserCard
        {...rest}
        model={model}
        className={cn('h-full w-full', className)}
        actions={<FriendCardActionsMenu friendId={model?.id} />}
        subtitle={
          <div className="flex gap-2">
            {model?.status?.emoji?.image?.high ? (
              <Image
                className="size-5"
                src={UrlFormatter.media(model?.status?.emoji?.image?.high)}
                alt="статус дружбы"
                height={32}
                width={32}
              />
            ) : null}
            {dateString}
          </div>
        }
      />
    </FriendShipActionsProvider>
  );
};
