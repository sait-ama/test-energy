'use client';

import { lazy, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import Admin from '@re/ui-kit/icons/admin';
import Panel from '@re/ui-kit/icons/panel';
import Settings from '@re/ui-kit/icons/settings';
import VerifyIcon from '@re/ui-kit/icons/verify';
import { Button } from '@re/ui-kit/ui/button';

import { usePublisherQuery } from '~entities/publisher/model/queries';
import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import { PublisherActions } from '~features/author-subscribe/ui/publisher-actions';
import { AddDaysButton } from '~features/small-publisher-add-promo/ui/add-days';
import { PublisherMonetizationButton } from '~pages/(publisher)/(settings)/monetization/ui/publisher-monetization-button';
import { PublisherStats } from '~pages/(publisher)/stats/stats';
import { Monetization, PublisherSchema } from '~shared/api/models/publisher';
import { Routing } from '~shared/config/routing';
import { OnlyLogged } from '~shared/lib/auth/only-logged';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { Container } from '~shared/ui/container';
import {
  EntityLayoutActions,
  EntityLayoutAvatarContainer,
  EntityLayoutHeader,
  EntityLayoutHeadingContainer,
  EntityLayoutTitle,
  EntityLayoutTitleContainer,
  EntityLayoutWallpaper,
} from '~shared/ui/entity-layout';
import { Wallpaper, WallpaperBackground } from '~shared/ui/wallpaper';
import { cn } from '~shared/utils/cn';
import { publicEnv } from '~shared/utils/env';
import { UrlFormatter } from '~shared/utils/url-formatter';

const PublisherManualWithdraw = lazy(
  /* webpackChunkName: "PublisherManualWithdraw" */ () =>
    import('~features/publisher-manual-withdraw/ui/publisher-manual-withdraw').then((v) => ({
      default: v.PublisherManualWithdraw,
    }))
);

export const Header = () => {
  const params = useParams<{ dir: string }>();
  const { dir } = params;
  const {
    data: { props: { can_update = false } = {}, content: publisher = {} as PublisherSchema } = {},
  } = usePublisherQuery({ variables: { params } });
  const monetization = publisher.monetization ?? 0;

  const hasWallpaper = publisher?.wallpaper?.high;

  return (
    <Container layout="slim" className="px-0">
      <div className="dark:bg-background relative mb-4 overflow-hidden bg-white pb-0 md:mt-4 md:rounded-md md:p-4">
        {hasWallpaper ? (
          <div className="mt-1 max-sm:p-2">
            <div className="dark:bg-background relative aspect-[3/2] w-full overflow-hidden rounded-md border-none bg-white p-4 pb-0 max-sm:p-2 md:max-h-[400px]">
              <EntityLayoutWallpaper>
                {({ wallpaper }) => (
                  <WallpaperBackground className="z-10 h-full w-full">
                    <Wallpaper withMask={false} src={wallpaper} className="object-cover" />
                  </WallpaperBackground>
                )}
              </EntityLayoutWallpaper>
            </div>
          </div>
        ) : null}

        <EntityLayoutHeader
          className={cn('relative z-20', hasWallpaper && 'mt-[-96px] max-sm:mt-[-116px]')}
        >
          <EntityLayoutAvatarContainer>
            {({ size, priority }) => (
              <PublisherAvatar
                imgSrc={publisher?.cover?.high ?? ''}
                alt={publisher.name}
                size={size}
                priority={priority}
              />
            )}
          </EntityLayoutAvatarContainer>

          <EntityLayoutHeadingContainer>
            <EntityLayoutTitleContainer className="flex w-full flex-row flex-wrap justify-center gap-4 sm:items-center sm:justify-between">
              <EntityLayoutTitle
                icon={
                  monetization >= Monetization.HAS_ABILITY && (
                    <VerifyIcon
                      className="mt-[2px]"
                      fill={
                        monetization === Monetization.HAS_ABILITY ? 'gray' : 'hsl(var(--r-primary))'
                      }
                      size={22}
                    />
                  )
                }
              >
                <>{publisher.name}</>
              </EntityLayoutTitle>

              <EntityLayoutActions>
                <Button asChild color="secondary" circle size="sm">
                  <StaffOnlyLink
                    target="_blank"
                    href={UrlFormatter.createUrl(
                      publicEnv('PANEL_URL'),
                      `/publishers/${publisher.id}/show`
                    )}
                  >
                    <Panel />
                  </StaffOnlyLink>
                </Button>
                <Button asChild color="secondary" circle size="sm">
                  <StaffOnlyLink
                    target="_blank"
                    href={UrlFormatter.createUrl(
                      publicEnv('ADMIN_URL'),
                      `publishers/publisher/${publisher.id}/change/`
                    )}
                  >
                    <Admin />
                  </StaffOnlyLink>
                </Button>
                {can_update && (
                  <Button asChild color="secondary" circle size="sm">
                    <Link
                      shallow={false}
                      prefetch={false}
                      href={Routing.Publisher.settings({
                        params: { dir, tab: 'profile' },
                      })}
                    >
                      <Settings />
                    </Link>
                  </Button>
                )}
                <PublisherActions publisherId={publisher.id} />
              </EntityLayoutActions>
            </EntityLayoutTitleContainer>
            <PublisherStats />
            <div className="flex w-full flex-wrap justify-center gap-2 sm:justify-start">
              <PublisherMonetizationButton />
              <AddDaysButton />
            </div>
            <OnlyLogged>
              <Suspense fallback={null}>
                <PublisherManualWithdraw />
              </Suspense>
            </OnlyLogged>
          </EntityLayoutHeadingContainer>
        </EntityLayoutHeader>
      </div>
    </Container>
  );
};
