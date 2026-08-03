'use client';

import { lazy, memo, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import Admin from '@re/ui-kit/icons/admin';
import Panel from '@re/ui-kit/icons/panel';
import Premium from '@re/ui-kit/icons/premium';
import SendIcon from '@re/ui-kit/icons/send';
import Settings from '@re/ui-kit/icons/settings';
import { Avatar, AvatarFallback, AvatarImage } from '@re/ui-kit/ui/avatar';
import { Button } from '@re/ui-kit/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@re/ui-kit/ui/tooltip';
import { cn } from '@re/ui-kit/utils/cn';

import { useUserSuspenseQuery } from '~entities/user/model/queries';
import { ProfileActionsTrigger } from '~features/author-subscribe/ui/profile-actions-trigger';
import { SendMessageToUserButton } from '~features/send-message-to-user-button/ui/send-message-to-user-button';
import { ManageFriendUserButton } from '~features/user-friend-action/ui/manage-friendship-button';
import { Badge } from '~pages/(user)/header/ui/ProfileCard/ui/Badge/badge';
import { UserLevel } from '~pages/(user)/header/ui/ProfileCard/ui/level';
import { ProfileStats } from '~pages/(user)/header/ui/ProfileCard/ui/Stats';
import { FriendsShipStatusEnum } from '~shared/api/models/friend';
import { Routing } from '~shared/config/routing';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { useTourItem } from '~shared/lib/tour/items';
import {
  EntityLayoutActions,
  EntityLayoutAvatarContainer,
  EntityLayoutHeader,
  EntityLayoutHeadingContainer,
  EntityLayoutTitle,
  EntityLayoutTitleContainer,
  EntityLayoutTitleIcon,
} from '~shared/ui/entity-layout';
import { ExpandableV2 } from '~shared/ui/expandable-v2';
import { MediaContent, MediaRoot } from '~shared/ui/media';
import { Wallpaper, WallpaperBackground } from '~shared/ui/wallpaper';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { YearSummaryButton } from './ui/year-summary-button';

const ProfileActions = lazy(() =>
  import(
    /* webpackChunkName: "ProfileActions" */ '~features/author-subscribe/ui/profile-actions'
  ).then((m) => ({ default: m.ProfileActions }))
);

const UserProfileAvatar = ({ className }: { className?: string }) => {
  const params = useParams<{ id: string }>();
  const { data: userData } = useUserSuspenseQuery({
    variables: { params: { userId: params?.id } },
  });

  const src = userData?.avatar.high;
  const frameSrc = userData?.frame.high;
  const alt = userData?.username ?? 'Аватар';
  const shape = 'square';
  const combinedStyle = {};
  const imgClassName = '';
  const showFrame = !!frameSrc;

  return (
    <Avatar
      src={UrlFormatter.media(src)}
      className={cn(
        'size-[105px] md:size-[168px]',
        {
          'outline-border relative select-none': !showFrame,
          'm-[15px] overflow-visible md:m-[21px]': showFrame,
        },
        className
      )}
      {...TestProps.id(`profile_icon`)}
      shape={shape}
      style={combinedStyle}
    >
      <AvatarImage draggable={false} alt={alt} className={imgClassName} />
      <AvatarFallback>{alt}</AvatarFallback>
      {showFrame && (
        <MediaRoot
          src={UrlFormatter.media(frameSrc)}
          className="absolute top-0 left-0 z-[2] scale-125 select-none"
        >
          <MediaContent alt="Рамка" />
        </MediaRoot>
      )}
    </Avatar>
  );
};

export const UserHeader = memo(() => {
  const params = useParams<{ id: string }>();
  const session = useSession();
  const { data: userData } = useUserSuspenseQuery({
    variables: { params: { userId: params?.id } },
  });
  const logged = useLogged();
  const isCurrentUser = session?.id === userData?.id;

  const userDetailAboutUserTourProps = useTourItem('user-detail-about-user');

  const actions = useMemo(() => {
    return (
      <EntityLayoutActions style={{ flex: 0 }} className="w-full">
        {isCurrentUser ? (
          <Button asChild color="secondary" circle size="sm">
            <Link
              shallow={false}
              prefetch={false}
              href={Routing.User.settings({
                params: { tab: 'profile' },
              })}
            >
              <Settings />
            </Link>
          </Button>
        ) : null}
        {logged && !isCurrentUser && userData.friend_status === FriendsShipStatusEnum.ACCEPTED && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <SendMessageToUserButton userId={userData.id} circle size="sm">
                  <SendIcon />
                </SendMessageToUserButton>
              </TooltipTrigger>
              <TooltipContent>Написать сообщение</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {logged && !isCurrentUser && <ManageFriendUserButton />}
        {logged && !isCurrentUser ? (
          <Suspense fallback={<ProfileActionsTrigger />}>
            <ProfileActions />
          </Suspense>
        ) : null}
      </EntityLayoutActions>
    );
  }, [userData]);

  const moderActions = useMemo(() => {
    return (
      <>
        <Button asChild color="secondary" circle size="sm">
          <StaffOnlyLink
            target="_blank"
            href={UrlFormatter.createUrl(publicEnv('PANEL_URL'), `/users/${params.id}/show`)}
          >
            <Panel />
          </StaffOnlyLink>
        </Button>
        <Button asChild color="secondary" circle size="sm">
          <StaffOnlyLink
            target="_blank"
            href={UrlFormatter.createUrl(publicEnv('ADMIN_URL'), `users/user/${params.id}/change/`)}
          >
            <Admin />
          </StaffOnlyLink>
        </Button>
      </>
    );
  }, [userData]);

  return (
    <div className="relative md:mt-8">
      <div className="mt-1 max-sm:p-2">
        <div
          className={cn(
            'dark:bg-background relative w-full overflow-hidden rounded-md border-none bg-white p-4 pb-0 max-sm:p-2 md:max-h-[400px]',
            !userData?.wallpaper?.high ? 'max-md:h-32 md:aspect-[10/2]' : 'aspect-[3/2]'
          )}
        >
          <WallpaperBackground
            className={cn('z-10 h-full w-full', {
              'bg-secondary dark:bg-secondary': !userData?.wallpaper?.high,
            })}
          >
            <Wallpaper withMask={false} src={userData?.wallpaper?.high} className="object-cover" />
          </WallpaperBackground>
          <ProfileStats className="absolute top-2 right-2 z-10" />
          <div className="absolute right-2 bottom-2 z-10 flex gap-3 max-sm:gap-2">
            {moderActions}
          </div>
        </div>
      </div>
      <EntityLayoutHeader
        className={cn(
          'relative z-10 mt-[-96px] gap-2 max-sm:mt-[-88px] max-sm:flex-row max-sm:flex-wrap max-sm:p-2 max-sm:pb-0 max-sm:pl-3'
        )}
        {...userDetailAboutUserTourProps}
      >
        <div className="flex flex-row gap-2 max-sm:w-full md:flex-col md:gap-1">
          <EntityLayoutAvatarContainer className="relative self-start">
            <Suspense>
              <UserProfileAvatar />
            </Suspense>
          </EntityLayoutAvatarContainer>
          <div className="hidden self-center md:block">
            <Badge />
          </div>
          <div className="mt-auto mb-4 ml-auto md:hidden">{actions}</div>
        </div>
        <EntityLayoutHeadingContainer hasWallpaper className="max-sm:items-start max-sm:gap-1">
          <div className="flex w-full flex-wrap gap-2 max-sm:justify-between">
            <EntityLayoutTitleContainer className="w-auto items-start">
              <EntityLayoutTitle
                className="gap-0"
                innerClassName="max-sm:ml-0"
                icon={
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'size-2 rounded-full',
                        userData.is_online ? 'bg-success' : 'bg-danger'
                      )}
                    />
                    {userData?.is_premium ? (
                      <EntityLayoutTitleIcon>
                        {({ size }) => <Premium size={size} />}
                      </EntityLayoutTitleIcon>
                    ) : null}
                  </div>
                }
              >
                {userData?.username}
              </EntityLayoutTitle>
            </EntityLayoutTitleContainer>
            <Badge className="min-h-auto w-auto justify-start p-0 md:hidden" />
            <div className="ml-auto hidden md:block">{actions}</div>
          </div>

          <YearSummaryButton />
          <UserLevel className="w-full max-sm:mt-2" />
          <ExpandableV2
            text={userData?.description ?? ''}
            className="text-muted-foreground text-sm max-sm:mt-2 md:px-2"
          />
        </EntityLayoutHeadingContainer>
      </EntityLayoutHeader>
    </div>
  );
});
