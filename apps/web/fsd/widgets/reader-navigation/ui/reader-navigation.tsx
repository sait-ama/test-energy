import type { ComponentProps } from 'react';
import { forwardRef, memo } from 'react';
import Link from 'next/link';

import ArrowLeft from '@re/ui-kit/icons/arrow-left';
import Bookmarks from '@re/ui-kit/icons/bookmarks';
import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import Report from '@re/ui-kit/icons/report';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { getTransitionStyle, useHeaderVisibility, useReader } from '~entities/reader/model/store';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { AccountMobile } from '~features/account/ui/account-mobile';
import { ReaderAsideDesktop, ReaderAsideMobile } from '~features/reader-aside/ui/reader-aside';
import { HeaderChapterNavigation } from '~features/reader-header-nav/ui/reader-header-nav';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { BookmarkButton } from '~pages/(title)/title-detail/ui/title-cover-block/bookmark-button';
import { Routing } from '~shared/config/routing';
import { useAccountModal } from '~shared/lib/account/use-account-modal';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { OnlyLogged } from '~shared/lib/auth/only-logged';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { CreateNoteInReaderAsync } from '~widgets/create-note-in-reader/ui/create-note-in-reader.async';
import { HeaderContainer } from '~widgets/navigation/ui/header-container';
import { DefaultNavigation } from '~widgets/navigation/ui/navigation';
import {
  LogoButton,
  NavigationDesktop,
  NotificationButton,
} from '~widgets/navigation/ui/navigation.desktop';

const HeaderDesktop = memo(
  () => {
    const { data: title } = useCurrentPageSuspenseTitleDetail();
    const contentType = useContentType();
    const headerVisibility = useHeaderVisibility((v) => v.visible);

    return (
      <>
        <NavigationDesktop
          style={getTransitionStyle(headerVisibility)}
          navLeft={
            <Link
              href={Routing.Title.detail({
                params: {
                  dir: title?.dir,
                  content: contentType,
                  tab: Routing.Title.TitleDetailTabs.MAIN,
                },
              })}
            >
              <Button variant="ghost">
                <ChevronLeft />
                {title?.main_name?.length && title?.main_name?.length > 30
                  ? `${title.main_name.slice(0, 30)}...`
                  : title?.main_name}
              </Button>
            </Link>
          }
          navCenter={<HeaderChapterNavigation />}
          navRight={
            <>
              <OnlyLogged>
                <BookmarkButton>
                  {({ children, disabled }) => (
                    <Button disabled={disabled} className="max-w-24 overflow-hidden text-ellipsis">
                      {children}
                    </Button>
                  )}
                </BookmarkButton>
              </OnlyLogged>

              <AuthorizedLink prefetch={false} href={Routing.User.bookmarks({ query: {} })}>
                <Button circle color="secondary">
                  <Bookmarks />
                </Button>
              </AuthorizedLink>
              <AuthorizedLink
                prefetch={false}
                href={Routing.User.notifications({ params: { tab: '0' } })}
              >
                <NotificationButton />
              </AuthorizedLink>
            </>
          }
        />
        <CreateNoteInReaderAsync />
        <ReaderAsideDesktop />
      </>
    );
  },
  () => true
);

const AccountMobileTrigger = forwardRef<HTMLButtonElement, ComponentProps<'button'>>(
  (props, ref) => {
    const session = useSession();
    const isLogged = useLogged();
    const { open: openAuthModal } = useAuthModal();
    const { open: openAccountModal } = useAccountModal();

    if (!isLogged)
      return (
        <Button
          onClick={() => {
            openAuthModal();
          }}
        >
          Войти
        </Button>
      );

    return (
      <Button
        variant="ghost"
        className="flex items-center !p-0"
        {...props}
        onClick={openAccountModal}
        ref={ref}
      >
        <UserAvatar
          size={36}
          alt={session?.username}
          avatarSrc={session?.avatar?.high}
          frameSrc={session?.frame?.high}
        />
      </Button>
    );
  }
);

const HeaderMobile = memo(
  () => {
    const { data: title } = useCurrentPageSuspenseTitleDetail();
    const contentType = useContentType();
    const headerVisibility = useHeaderVisibility((v) => v.visible);
    const activeChapterId = useReader((v) => v.activeChapterId);
    return (
      <>
        <div
          className={cn('fixed inset-x-0 top-0 z-[1000]')}
          style={getTransitionStyle(headerVisibility)}
        >
          <HeaderContainer className="flex h-full min-h-[var(--bottom-bar-height)] items-center justify-between">
            <div className="flex gap-2">
              <LogoButton />
              <Link
                href={Routing.Title.detail({
                  params: {
                    dir: title?.dir,
                    content: contentType,
                    tab: Routing.Title.TitleDetailTabs.MAIN,
                  },
                })}
              >
                <Button color="secondary" circle>
                  <ArrowLeft />
                </Button>
              </Link>
            </div>
            <HeaderChapterNavigation />

            <div className="flex gap-2">
              <ReportModalAsync type="chapter" target={activeChapterId}>
                <Button circle color="secondary">
                  <Report />
                </Button>
              </ReportModalAsync>
              <AccountMobile>
                <AccountMobileTrigger />
              </AccountMobile>
            </div>
          </HeaderContainer>
        </div>
        <ReaderAsideMobile />
      </>
    );
  },
  () => true
);

export const Header = () => {
  return <DefaultNavigation HeaderMobile={HeaderMobile} HeaderDesktop={HeaderDesktop} />;
};

export const Footer = () => {
  return null;
};
