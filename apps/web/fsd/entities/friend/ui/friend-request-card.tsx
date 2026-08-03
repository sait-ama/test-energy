import React, { ComponentPropsWithoutRef, forwardRef, memo } from 'react';
import Link from 'next/link';
import { useFormatter, useNow } from 'next-intl';

import { Badge, BadgeProps } from '@re/ui-kit/ui/badge';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UserAvatar } from '~entities/user/ui/user-avatar';
import { config } from '~features/friend-request-status-manage/model/consts';
import { useManageStatusFriendRequestMutation } from '~features/friend-request-status-manage/model/mutations';
import type { FriendRequestSchema, FriendRequestUserSchema } from '~shared/api/models/friend';
import { FriendRequestStatusEnum } from '~shared/api/models/friend';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { htmlRegExp } from '~shared/lib/regexp/is-html';
import { sanitizeSync } from '~shared/lib/sanitize/sanitize-sync';
import { useSession } from '~shared/lib/session/use-session';
import type { CardProps } from '~shared/ui/card';
import { Card, CardContent, CardFooter, CardHeader } from '~shared/ui/card';
import { SpoiledText } from '~shared/ui/spoiled-text';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { getClientDate } from '~shared/utils/get-client-date';

export const statusColorsMap = {
  [FriendRequestStatusEnum.WAITING]: 'outline',
  [FriendRequestStatusEnum.ACCEPTED]: 'success',
  [FriendRequestStatusEnum.CANCELED_BY_TO]: 'destructive',
  [FriendRequestStatusEnum.CANCELED_BY_FROM]: 'destructive',
} satisfies Record<FriendRequestStatusEnum, BadgeProps['variant']>;

export const statusLabelsMap = {
  [FriendRequestStatusEnum.WAITING]: 'Ожидает ответа',
  [FriendRequestStatusEnum.ACCEPTED]: 'Принята',
  [FriendRequestStatusEnum.CANCELED_BY_FROM]: 'Отменена отправителем',
  [FriendRequestStatusEnum.CANCELED_BY_TO]: 'Отклонена получателем',
} satisfies Record<FriendRequestStatusEnum, string>;

export const actionLabelMap = {
  [FriendRequestStatusEnum.ACCEPTED]: 'Принять',
  [FriendRequestStatusEnum.CANCELED_BY_TO]: 'Отклонить',
  [FriendRequestStatusEnum.CANCELED_BY_FROM]: 'Отменить',
} satisfies Record<Exclude<FriendRequestStatusEnum, FriendRequestStatusEnum.WAITING>, string>;

export const actionVariantMap = {
  [FriendRequestStatusEnum.ACCEPTED]: 'default',
  [FriendRequestStatusEnum.CANCELED_BY_TO]: 'outline',
  [FriendRequestStatusEnum.CANCELED_BY_FROM]: 'outline',
} satisfies Record<
  Exclude<FriendRequestStatusEnum, FriendRequestStatusEnum.WAITING>,
  ButtonProps['variant']
>;

interface FriendRequestUserCardProps extends ComponentPropsWithoutRef<'div'> {
  model: FriendRequestUserSchema;
  type?: 'from' | 'to';
}

const FriendRequestUserCard = memo((props: FriendRequestUserCardProps) => {
  const { model, type, className, ...rest } = props;
  const userId = useSession((v) => v?.id);

  return (
    <div className={cn('flex flex-row items-center gap-3', className)} {...rest}>
      <Link
        shallow={false}
        prefetch={false}
        className="hover:text-primary"
        href={Routing.User.detail({ params: { id: model.id, tab: 'about' } })}
      >
        <UserAvatar
          size={48}
          frameSrc={model.frame.high}
          avatarSrc={model.avatar.mid}
          alt={model.username}
        />
      </Link>
      <div className="flex flex-col overflow-hidden text-ellipsis">
        <ReText lineClamp={1} weight="bold">
          {userId === model.id ? 'Вы' : model.username}
        </ReText>

        <ReText size="sm" color="muted-foreground">
          {type === 'from' ? 'Отправитель' : 'Получатель'}
        </ReText>
      </div>
    </div>
  );
});

interface FriendRequestCardProps extends Omit<CardProps, 'id'> {
  model: FriendRequestSchema;
}

export const FriendRequestCard = memo(
  forwardRef<HTMLDivElement, FriendRequestCardProps>((props, ref) => {
    const { model, className, children, ...other } = props;
    const formatter = useFormatter();
    const clientDate = getClientDate({ serverDateString: model.date });
    const now = useNow();

    const sanitizedMessage = sanitizeSync(model.message);
    const truncatedMessage = sanitizedMessage.replace(htmlRegExp, '');

    return (
      <Card
        {...other}
        className={cn('border-border flex flex-col justify-between border', className)}
        ref={ref}
        variant="ghost"
      >
        <CardContent withHover={false} className="flex flex-col gap-4 px-5 pt-4">
          <CardHeader className="flex w-full flex-row items-center justify-between gap-4 p-0">
            <div className="flex gap-2">
              <ReText weight="semibold">Заявка №{model.id}</ReText>
            </div>

            <ReText color="muted-foreground" size="xs">
              {formatter.relativeTime(clientDate!, now)}
            </ReText>
          </CardHeader>
          <div className="flex flex-row flex-wrap justify-between gap-4 max-sm:items-center">
            <FriendRequestUserCard type="from" model={model.from_user} />
            <FriendRequestUserCard type="to" model={model.to_user} />
          </div>
          {truncatedMessage ? (
            <div className="bg-background inline-flex flex-col rounded-md p-2 px-4">
              <ReText lineClamp={1} weight="medium" size="sm">
                Сообщение
              </ReText>
              <SpoiledText className="text-muted-foreground">{sanitizedMessage}</SpoiledText>
            </div>
          ) : null}
        </CardContent>
        {children ? (
          <CardFooter className="border-border flex h-14 w-full justify-between border-t px-5 py-4">
            <Badge variant={statusColorsMap[model.status]}>{statusLabelsMap[model.status]}</Badge>
            {model.status === FriendRequestStatusEnum.WAITING ? (
              <div className="flex gap-2">{children}</div>
            ) : null}
          </CardFooter>
        ) : null}
      </Card>
    );
  })
);

interface FriendRequestChangeStatusMenuProps {
  model: FriendRequestSchema;
}

export const FriendRequestChangeStatusMenu = (props: FriendRequestChangeStatusMenuProps) => {
  const { model } = props;
  const session = useSession();
  const { id: sessionId } = session ?? {};

  const isCurrentUserRecipient = sessionId === model.to_user.id;
  const isCurrentUserSender = sessionId === model.from_user.id;

  const user = isCurrentUserSender
    ? model.from_user
    : isCurrentUserRecipient
      ? model.to_user
      : null;

  const { mutateAsync } = useManageStatusFriendRequestMutation(model.id, model.to_user.id);

  if (!user) return null;

  if (
    model.status === FriendRequestStatusEnum.CANCELED_BY_TO ||
    model.status === FriendRequestStatusEnum.CANCELED_BY_FROM
  )
    return null;

  const availableStatuses = config[model.status][isCurrentUserRecipient ? 'to' : 'from'];

  if (!availableStatuses.length) return null;

  const handleApply = async (status: FriendRequestStatusEnum) => {
    const toast = await importToastAsync();
    try {
      await mutateAsync({ status });
      toast.success('Статус заявки успешно изменён');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return availableStatuses
    .sort()
    .reverse()
    .map((it) => (
      <Button key={it} variant={actionVariantMap[it]} size="sm" onClick={() => handleApply(it)}>
        {actionLabelMap[it]}
      </Button>
    ));
};
