'use client';

import type { ReactNode } from 'react';
import * as React from 'react';
import { lazy, memo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Bookmarks from '@re/ui-kit/icons/bookmarks';
import Cards from '@re/ui-kit/icons/cards';
import DotsHorizontalIcon from '@re/ui-kit/icons/dots-horizontal';
import MessageIcon from '@re/ui-kit/icons/message';
import Notification from '@re/ui-kit/icons/notification';
import Search from '@re/ui-kit/icons/search';
import TowerRating from '@re/ui-kit/icons/tower-rating';
import Video from '@re/ui-kit/icons/video';
import { Button, ButtonProps, buttonVariants } from '@re/ui-kit/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuListItem,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@re/ui-kit/ui/navigation-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { AccountDesktop, AccountDesktopRoot } from '~features/account/ui/account-desktop';
import { ThemeToggleButton } from '~features/theme-toggle';
import { Preference } from '~shared/api/models/user';
import { Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { useTourItem } from '~shared/lib/tour/items';
import { BadgeRoot, BadgeValue } from '~shared/ui/badge-extended';
import { BrandIcon } from '~shared/ui/brand';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { NoSSR } from '~shared/ui/no-ssr';
import { UrlFormatter } from '~shared/utils/url-formatter';
import { createCatalogNav, createTopNav } from '~widgets/navigation/model/const';
import type { HeaderProps } from '~widgets/navigation/model/types';
import { HeaderBase } from '~widgets/navigation/ui/header-container';

const UnloggedSettingsPopover = lazy(() =>
  import(
    /* webpackChunkName: "UnloggedSettingsPopover" */ '~features/unlogged-settings-popover/ui/unlogged-settings-popover'
  ).then((m) => ({
    default: m.UnloggedSettingsPopover,
  }))
);

const AccountDesktopTrigger = (props: ButtonProps) => {
  const user = useSession();
  const tourProps = useTourItem('profile-menu');

  return (
    <Button
      {...tourProps}
      {...props}
      variant="ghost"
      className={cn('flex !size-9 items-center !p-0', { 'rounded-[0]': !!user?.frame?.high })}
    >
      <UserAvatar
        avatarSrc={user?.avatar?.mid}
        frameSrc={user?.frame?.high}
        alt={user?.username ?? ''}
        size={36}
        className={cn(!user?.avatar?.mid && !user?.frame?.high && 'rounded-full')}
      />
      <span className="sr-only">{user?.username}</span>
    </Button>
  );
};

const SearchButton = ({ className }: { className?: string }) => {
  const { open } = useSearchModal();
  const t = useTranslations('navigation.search');

  return (
    <Button
      className={cn(
        'ml-2 flex w-full max-w-[280px] gap-2 pr-8 pl-4 select-none sm:pr-8 lg:pr-24',
        className
      )}
      color="secondary"
      onClick={() => {
        open();
      }}
    >
      <Search size={20} />{' '}
      <ReText color="muted-foreground" size="sm" className="w-full">
        {t('placeholder')}
      </ReText>
    </Button>
  );
};

export const LogoButton = ({ className }: { className?: string }) => {
  const t = useTranslations('navigation.header');

  return (
    <Link shallow={false} prefetch={false} href="/">
      <Button
        aria-label={t('logotype')}
        circle
        className={cn('text-foreground', className)}
        color="secondary"
      >
        <BrandIcon size={32} />
      </Button>
      <span className="sr-only">{t('logotype')}</span>
    </Link>
  );
};

const Notifications = () => {
  const count_notifications = useSession((v) => v?.count_notifications);

  return (
    <Button color="secondary" circle>
      <BadgeRoot>
        <Notification size={20} className="text-secondary-foreground" />
        {count_notifications ? (
          <BadgeValue className="-top-2 -right-2 select-none">{count_notifications}</BadgeValue>
        ) : null}
      </BadgeRoot>
    </Button>
  );
};

export const NotificationButton = () => {
  const logged = useLogged();

  return logged ? <Notifications /> : null;
};

const TopMainNavigationButton = () => {
  const preference = useSession()?.preference ?? Preference.ALL;
  const contentType = useContentType();
  const t = useTranslations(`navigation.header.tops-tabs.main.${contentType}`);

  const imgUrl =
    preference === Preference.EVA
      ? UrlFormatter.media('public/header-nav/top-sagiri.webp')
      : preference === Preference.ADAM
        ? UrlFormatter.media('public/header-nav/top-sagiri.webp')
        : UrlFormatter.media('public/header-nav/top-ram.webp');

  return (
    <NavigationMenuListItem
      className="border-border border"
      href={Routing.Title.top({ params: { content: contentType } })}
      title={t('title')}
      right={
        <LinearGradient
          className="relative -mb-[8px] w-full !justify-end overflow-hidden rounded-xs group-hover:after:[--r-linear-gradient-color:var(--r-muted)]"
          src={imgUrl}
          alt={t('title')}
          quality={80}
          width={120}
          height={120}
        />
      }
    >
      {t('description')}
    </NavigationMenuListItem>
  );
};

const NavigationButtons = memo(() => {
  const contentType = useContentType();
  const t = useTranslations('navigation.header');

  const { features } = useSiteConfig()!;

  return (
    <div className={cn('hidden h-full items-center gap-2 md:flex')}>
      <Link
        title={t(`catalog`)}
        prefetch={false}
        href={Routing.Title.catalog({
          params: { content: contentType },
        })}
        className={cn(
          navigationMenuTriggerStyle(),
          buttonVariants({
            variant: 'default',
            color: 'secondary',
          }),
          '!w-full px-6'
        )}
      >
        {t('catalog')}
      </Link>
      <Link
        title={t(`tops`)}
        prefetch={false}
        href={Routing.Title.top({ params: { content: contentType } })}
        className={cn(
          navigationMenuTriggerStyle(),
          buttonVariants({
            variant: 'default',
            color: 'secondary',
          }),
          '!w-full px-6'
        )}
      >
        {t('tops')}
      </Link>

      {features[Features.FORUM] && (
        <Link
          title={t(`forum`)}
          prefetch={false}
          href={Routing.Forum.Feed.get({
            query: {
              // week: true,
              ordering: '-id',
              // exclude_tag: [12, 13, 14],
            },
          })}
          className={cn(
            navigationMenuTriggerStyle(),
            buttonVariants({
              variant: 'default',
              color: 'secondary',
            }),
            '!w-full px-6'
          )}
        >
          {t('forum')}
        </Link>
      )}

      <div className="bg-secondary flex h-[28px] w-[2px] items-center rounded-sm" />

      <NavigationMenu>
        <NavigationMenuList className="space-x-2 select-none">
          <NavigationMenuItem value="catalog">
            <Button asChild color="secondary">
              <NavigationMenuTrigger className="cs-modal-catalog">
                <DotsHorizontalIcon />
              </NavigationMenuTrigger>
            </Button>

            <NavigationMenuContent>
              <ul className="grid gap-2 p-2 md:w-[400px] lg:w-[400px]">
                {createCatalogNav().map((it) => (
                  <NavigationMenuListItem
                    className="border-border border"
                    key={it.key}
                    href={it.href}
                    left={<Cards className="ml-4 size-8" />}
                    title={t(`catalog-tabs.${it.key}.title`)}
                    //right={<ChevronRightIcon className="mr-4 size-6" />}
                  >
                    {t(`catalog-tabs.${it.key}.description`)}
                  </NavigationMenuListItem>
                ))}
                {createTopNav().map((it) => (
                  <NavigationMenuListItem
                    className="border-border border"
                    key={it.key}
                    href={it.href}
                    left={<TowerRating className="ml-4 size-8" />}
                    title={t(`tops-tabs.${it.key}.title`)}
                    //right={<ChevronRightIcon className="mr-4 size-6" />}
                  >
                    {t(`tops-tabs.${it.key}.description`)}
                  </NavigationMenuListItem>
                ))}
                {features[Features.SHORTS] ? (
                  <NavigationMenuListItem
                    className="border-border border"
                    href={Routing.Moment.shorts()}
                    left={<Video className="ml-4 size-8" />}
                    title={t(`tops-tabs.shorts.title`)}
                    // right={<ChevronRightIcon className="mr-4 size-6" />}
                  >
                    {t(`tops-tabs.shorts.description`)}
                  </NavigationMenuListItem>
                ) : null}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
});

const NavigationRight = () => {
  const isLogged = useLogged();
  const t = useTranslations('navigation.header');
  const { features } = useSiteConfig();

  return (
    <>
      <SearchButton />

      {isLogged ? (
        <AuthorizedLink prefetch={false} href={Routing.User.bookmarks({})}>
          <Button
            color="secondary"
            className="flex gap-1 !p-2 select-none lg:!px-4"
            {...TestProps.id('bookmarks_btn')}
          >
            <Bookmarks />
            <span className="hidden lg:block">{t('bookmarks')}</span>
          </Button>
        </AuthorizedLink>
      ) : null}

      {isLogged ? (
        <>
          {features[Features.CHAT] ? (
            <AuthorizedLink prefetch={false} href={Routing.User.chat()}>
              <Button color="secondary" circle>
                <MessageIcon />
              </Button>
            </AuthorizedLink>
          ) : null}

          <AuthorizedLink
            prefetch={false}
            href={Routing.User.notifications({ params: { tab: '0' } })}
          >
            <Notifications />
          </AuthorizedLink>
        </>
      ) : (
        <NoSSR>
          <ThemeToggleButton variant="secondary" />
        </NoSSR>
      )}
    </>
  );
};

const ListItem = React.forwardRef<React.ComponentRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
  ({ className, title, children, ...props }, ref) => (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block space-y-1 rounded-md p-3 leading-none no-underline outline-hidden transition-colors select-none',
            className
          )}
          {...props}
        >
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
);
ListItem.displayName = 'ListItem';

export const NavigationDesktop = memo(
  (
    props: HeaderProps & {
      navLeft?: ReactNode;
      navCenter?: ReactNode;
      navRight?: ReactNode;
    }
  ) => {
    const { subheader, className, navLeft, navRight, navCenter, transparent, style } = props;

    return (
      <HeaderBase
        transparent={transparent}
        subheader={subheader}
        className={className}
        style={style}
        headerLeft={
          <div className={cn('flex h-full items-center gap-4')}>
            <LogoButton />
            {navLeft ?? <NavigationButtons />}
          </div>
        }
        headerCenter={<div className="h-full">{navCenter}</div>}
        headerRight={
          <div className={cn('flex h-full items-center justify-end gap-2')}>
            {navRight ?? <NavigationRight />}
            <AccountDesktopRoot>
              <AccountDesktop>
                <AccountDesktopTrigger />
              </AccountDesktop>
            </AccountDesktopRoot>
          </div>
        }
      />
    );
  }
);
