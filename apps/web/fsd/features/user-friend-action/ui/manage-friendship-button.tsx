'use client';
import { useParams } from 'next/navigation';

import { PersonCheckIcon } from '@re/ui-kit/icons/person-check';
import Trash from '@re/ui-kit/icons/trash';
import { Button, ButtonProps, buttonVariants } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { Separator } from '@re/ui-kit/ui/separator';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';
import { useQuery } from '@tanstack/react-query';

import { useUserQuery } from '~entities/user/model/queries';
import {
  useChangeFriendStatus,
  useCreateManageCurrentUserFriendRequestMutation,
  useRemoveFriendMutation,
} from '~features/user-friend-action/model/mutations';
import {
  SendMessageRequestInput,
  SendMessageRequestLayout,
  SendMessageRequestTitle,
  SendMessageRequestTrigger,
  SendMessageRoot,
} from '~features/user-friend-action/ui/fragments';
import { FormsTypes } from '~shared/api/models/forms';
import { FriendsShipStatusEnum } from '~shared/api/models/friend';
import { EmojiSchema } from '~shared/api/models/shop';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { getTypesBaseKey } from '~shared/lib/use-types-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { UrlFormatter } from '~shared/utils/url-formatter';

const variants = {
  wait: {
    disabled: true,
    variant: 'ghost',
    className: 'bg-muted',
    children: 'Заявка в друзья',
  },
  friends: {
    className: 'border-none text-destructive w-full',
    variant: 'ghost',
    disabled: false,
    children: 'Удалить из друзей',
  },
  DEFAULT: {
    variant: 'secondary',
    children: 'Добавить в друзья',
  },
} satisfies Record<Partial<'wait' | 'friends' | 'DEFAULT'>, Partial<ButtonProps>>;

// todo: dynamic
export const ManageFriendUserButton = () => {
  const { id } = useParams<{ id: string }>();
  const { isLoading } = useUserQuery({ variables: { params: { userId: id } } });

  return (
    <SkeletonSlot
      className="h-[30px] w-[30px] rounded-full"
      show={isLoading}
      render={<ManageFriendUserButtonWithRequest />}
    />
  );
};

const ManageFriendUserButtonWithRequest = () => {
  const { id } = useParams() as { id: NumberIsomorphicV2 };
  const sessionId = useSession((v) => v?.id)!;
  const { data: user } = useUserQuery({ variables: { params: { userId: id } } });
  // @ts-ignore
  const { friend_status = FriendsShipStatusEnum.NO_FRIENDS, id: requestId } = user ?? {};
  const { mutateAsync: inviteAsync } = useCreateManageCurrentUserFriendRequestMutation();
  const { mutateAsync: removeAsync } = useRemoveFriendMutation(requestId!);
  const { data: { content: { statuses = [] } = {} } = {} } = useQuery({
    ...getTypesBaseKey<FormsTypes.FRIENDS, { id: number; name: string; emoji: EmojiSchema }>({
      get: ['statuses'],
      type: FormsTypes.FRIENDS,
    }),
    enabled: friend_status === FriendsShipStatusEnum.ACCEPTED,
  });

  const { mutateAsync: changeStatusAsync } = useChangeFriendStatus({
    friendId: id,
    userId: sessionId,
  });

  const handleFriendToggle = async ({ message }: { message?: string }) => {
    const toast = await importToastAsync();
    try {
      if (!requestId) return;
      // await mutateAsync({ request_id: requestId });
      if (friend_status === FriendsShipStatusEnum.NO_FRIENDS) {
        await inviteAsync({ to_user: requestId, message });
        toast.success('Заявка на дружбу отправлена, ожидайте');
      } else if (friend_status === FriendsShipStatusEnum.ACCEPTED) {
        await removeAsync();
        toast.success('Теперь вы не друзья:(');
      }
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const toggleStatus = async ({
    id,
    name,
    ...other
  }: Required<{ id: number; name: string; emoji: EmojiSchema }>) => {
    const toast = await importToastAsync();
    try {
      await changeStatusAsync({ status: id, name, ...other });
      toast.success(`Статус дружбы изменён на ${name}`);
    } catch (e: unknown) {
      await resolveErrorAsync(e);
      logger.error(e);
    }
  };
  const curFriendStatus = user?.friend_meta?.status
    ? statuses.find((v) => v.name === user?.friend_meta?.status?.name)
    : undefined;

  if (friend_status === FriendsShipStatusEnum.ACCEPTED) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="h-[30px] w-max rounded-md px-4 py-1">
          <Button
            variant="secondary"
            className="pr-2 pl-0"
            endIcon={
              <>
                {curFriendStatus?.emoji?.image?.high ? (
                  <img
                    className="size-5 self-start"
                    src={UrlFormatter.media(curFriendStatus?.emoji?.image?.high) as string}
                    alt={curFriendStatus.name}
                    style={{ width: 30, height: 30 }}
                  />
                ) : (
                  <PersonCheckIcon />
                )}
                {/* <ChevronDown /> */}
              </>
            }
          >
            {/* <span className="max-sm:hidden">{curFriendStatus?.name || 'Вы дружите'}</span> */}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup className="cs-modal-profile-friends space-y-2">
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.id}
                className="w-full bg-transparent bg-none shadow-none"
                asChild
              >
                <Button
                  onClick={async () => {
                    // @ts-ignore
                    await toggleStatus(status);
                  }}
                  variant="secondary"
                  className={cn('hover:border-primary/60 justify-between bg-none', {
                    'border-primary border': status.id === user?.friend_meta?.id,
                  })}
                  endIcon={
                    status?.emoji?.image?.high ? (
                      <img
                        className="size-5 self-start"
                        src={UrlFormatter.media(status?.emoji?.image?.high)}
                        alt="статус дружбы"
                        style={{ width: 30, height: 30 }}
                      />
                    ) : null
                  }
                  key={status.id}
                  size="lg"
                >
                  {status.name}
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <Separator className="my-2" />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Button
                startIcon={<Trash />}
                size="sm"
                onClick={handleFriendToggle}
                {...variants.friends}
              />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <SendMessageRoot
      onSubmit={async (vals) => {
        if (friend_status === FriendsShipStatusEnum.NO_FRIENDS) {
          await handleFriendToggle(vals);
        }
      }}
      fallbackClassName={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-[120px]')}
    >
      <SendMessageRequestTrigger asChild>
        {/*@ts-ignore*/}
        <Button size="sm" {...(variants?.[friend_status] || variants.DEFAULT)} />
      </SendMessageRequestTrigger>
      <SendMessageRequestLayout className="md:max-w-[300px]">
        {/*@ts-ignore*/}
        <SendMessageRequestTitle>
          Добавьте в друзья пользователя <strong> {user.username}</strong>, отправив ему сообщение,
          если хотите
        </SendMessageRequestTitle>
        {/*@ts-ignore*/}
        {friend_status === FriendsShipStatusEnum.ACCEPTED && (
          // @ts-ignore
          <Button
            size="sm"
            onClick={handleFriendToggle}
            {...(variants?.[friend_status] || variants.DEFAULT)}
          />
        )}
        {/*todo add chat message*/}
        {friend_status === FriendsShipStatusEnum.NO_FRIENDS && <SendMessageRequestInput />}
      </SendMessageRequestLayout>
    </SendMessageRoot>
  );
};
