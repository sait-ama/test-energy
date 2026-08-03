'use client';

import type { ComponentType, HTMLAttributes, ReactNode } from 'react';
import * as React from 'react';
import { forwardRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Bookmark from '@re/ui-kit/icons/bookmarks';
import Element from '@re/ui-kit/icons/element';
import Menu from '@re/ui-kit/icons/menu';
import Notification from '@re/ui-kit/icons/notification';
import Search from '@re/ui-kit/icons/search';
import { Button } from '@re/ui-kit/ui/button';
import { Slot, Slottable } from '@re/ui-kit/ui/slot';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { AccountMobile } from '~features/account/ui/account-mobile';
import { Routing } from '~shared/config/routing';
import { useScrollOffsetTrigger } from '~shared/hooks/use-scroll-offset-trigger';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { useSearchModal } from '~shared/lib/search/use-search-modal';
import { useSession } from '~shared/lib/session/use-session';
import { useTourItem } from '~shared/lib/tour/items';
import { BadgeRoot, BadgeValue } from '~shared/ui/badge-extended';
import { BrandIcon } from '~shared/ui/brand';
import type { IconProps } from '~shared/ui/icon';
import { HeaderContainer } from '~widgets/navigation/ui/header-container';

const AccountMobileTrigger = forwardRef<HTMLButtonElement>((props, ref) => {
  const t = useTranslations('navigation.header');
  const tourProps = useTourItem('profile-menu');

  return (
    <button
      {...props}
      ref={ref}
      {...tourProps}
      aria-label={t('menu')}
      className="text-muted-foreground flex h-full w-1/5 flex-col items-center justify-center gap-1 text-xs"
    >
      <Menu size={16} />
      {t('menu')}
    </button>
  );
});

const SearchButton = ({ className }: { className?: string }) => {
  const { open } = useSearchModal();
  const t = useTranslations('navigation.search');

  return (
    <Button
      className={cn('flex w-full gap-2', className)}
      color="secondary"
      onClick={() => {
        open();
      }}
    >
      <Search size={16} />
      <ReText color="muted-foreground" size="sm">
        {t('placeholder')}
      </ReText>
    </Button>
  );
};

interface HeaderLinkProps {
  className?: string;
  children: ReactNode;
  href: string;
  icon: ComponentType<IconProps>;
  asChild?: boolean;
}

const getBottomBarLinkClasses = ({
  pathname,
  href,
  className,
}: {
  pathname: string;
  href: string;
  className?: string;
}) =>
  cn(
    'flex h-full w-1/5 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground',
    {
      'text-foreground': pathname === href,
    },
    className
  );

const BottomBarLink = (props: HeaderLinkProps) => {
  const { href, children, icon: Icon, className, asChild, ...rest } = props;
  const pathname = usePathname();

  const Component = asChild ? Slot : Link;

  return (
    <Component
      prefetch={false}
      href={href}
      className={getBottomBarLinkClasses({ pathname, href, className })}
      {...rest}
    >
      <Icon size={16} />
      <Slottable>{children}</Slottable>
    </Component>
  );
};

const NotificationsButton = () => {
  const session = useSession();
  const t = useTranslations('navigation.header');
  const pathname = usePathname();

  return (
    <AuthorizedLink
      prefetch={false}
      href={Routing.User.notifications({ params: { tab: '0' } })}
      className="flex w-1/5 justify-center"
    >
      <BadgeRoot
        className={getBottomBarLinkClasses({
          pathname,
          href: Routing.User.notifications({ params: { tab: '0' } }),
          className: 'inline-flex w-auto',
        })}
      >
        <Notification size={16} />
        {t('notifications')}
        {session?.count_notifications ? (
          <BadgeValue className="-right-2">{session.count_notifications}</BadgeValue>
        ) : null}
      </BadgeRoot>
    </AuthorizedLink>
  );
};

export const BottomBarMobile = memo(
  (props: HTMLAttributes<HTMLDivElement> & { subheader?: ReactNode }) => {
    const { className, style } = props;
    const contentType = useContentType();
    const t = useTranslations('navigation.header');

    return (
      <header className={cn('fixed inset-x-0 bottom-0 z-[1000]', className)} style={style}>
        <HeaderContainer
          containerClassName="!items-start "
          className="h-full flex-nowrap justify-center gap-1"
          style={{
            height: 'calc(var(--bottom-bar-height) + env(safe-area-inset-bottom))',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          disableScrollEffect
        >
          <BottomBarLink
            icon={Element}
            prefetch={false}
            href={Routing.Title.catalog({
              params: {
                content: contentType,
              },
            })}
          >
            {t('catalog')}
          </BottomBarLink>
          <AuthorizedLink asChild>
            <BottomBarLink icon={Bookmark} href={Routing.User.bookmarks({ query: {} })}>
              {t('bookmarks')}
            </BottomBarLink>
          </AuthorizedLink>

          <div className="flex h-full w-1/5 items-center justify-center">
            <Button color="secondary" asChild circle name="logo">
              <Link shallow={false} prefetch={false} href={Routing.Home.main({ query: {} })}>
                <BrandIcon size={36} className="text-secondary-foreground" />
                <span className="sr-only">{t('logotype')}</span>
              </Link>
            </Button>
          </div>

          <NotificationsButton />
          <AccountMobile>
            <AccountMobileTrigger />
          </AccountMobile>
        </HeaderContainer>
      </header>
    );
  }
);

interface HeaderMobileProps {
  subheader?: ReactNode;
  className?: string;
  transparent?: boolean;
  style?: React.CSSProperties;
}

export const HeaderMobile = (props: HeaderMobileProps) => {
  const { subheader, className, transparent, style } = props;

  //   const show = useScrollTrigger();
  const hasScrolled = useScrollOffsetTrigger(60);

  const showHeader = !hasScrolled; //|| show;

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 transition-all',
        showHeader ? 'translate-y-0' : '-translate-y-full',
        className
      )}
      style={style}
    >
      <HeaderContainer
        className={cn('h-full min-h-[var(--bottom-bar-height)] flex-col justify-center')}
        transparent={transparent}
      >
        <SearchButton className="h-[40px]" />
        {subheader}
      </HeaderContainer>
    </div>
  );
};

export const NavigationMobile = memo((props: { subheader?: ReactNode }) => (
  <>
    <HeaderMobile subheader={props.subheader} />
    <BottomBarMobile />
  </>
));
