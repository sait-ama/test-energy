import React, { memo } from 'react';
import Image from 'next/image';
import { useFormatter, useNow } from 'next-intl';

import { cn } from '@re/ui-kit/utils/cn';

import { VerticalCardV2Props, VerticalUserCardV2 } from '~entities/user/ui/vertical-user-card';
import type { FriendShipSchema } from '~shared/api/models/friend';
import { UrlFormatter } from '~shared/utils/url-formatter';

export interface FriendCardProps<T extends FriendShipSchema> extends VerticalCardV2Props<T> {}

export const VerticalFriendCard = memo(<T extends FriendShipSchema>(props: FriendCardProps<T>) => {
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

  const status = model?.status!;

  const statusNode = (
    <div className="flex flex-col items-center gap-1">
      {status?.emoji?.image?.high ? (
        <Image
          className="size-5"
          src={UrlFormatter.media(status?.emoji?.image?.high)}
          alt="статус дружбы"
          height={32}
          width={32}
        />
      ) : null}
      {/*<ReText>{status?.name}</ReText>*/}
    </div>
  );

  return (
    <VerticalUserCardV2
      {...rest}
      model={model}
      className={cn('h-full w-full !border-none', className)}
      subtitle={
        <div className="flex gap-2">
          {/*<FriendCardActionsMenu className="self-start" friendId={model?.id} />*/}
          {dateString}
          {model?.status ? statusNode : null}
        </div>
      }
    />
  );
});
