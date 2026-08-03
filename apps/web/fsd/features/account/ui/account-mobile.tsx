'use client';

import * as React from 'react';
import { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';

import AdminIcon from '@re/ui-kit/icons/admin';
import BillingIcon from '@re/ui-kit/icons/billing';
import Bookmarks from '@re/ui-kit/icons/bookmarks';
import Cycle from '@re/ui-kit/icons/cycle';
import EditIcon from '@re/ui-kit/icons/edit';
import Feedback from '@re/ui-kit/icons/feedback';
import Form from '@re/ui-kit/icons/form';
import ForumIcon from '@re/ui-kit/icons/forum';
import HistoryIcon from '@re/ui-kit/icons/history';
import LogoutIcon from '@re/ui-kit/icons/logout';
import Medal from '@re/ui-kit/icons/medal';
import MenuIcon from '@re/ui-kit/icons/menu';
import MessageIcon from '@re/ui-kit/icons/message';
import Notification from '@re/ui-kit/icons/notification';
import PanelIcon from '@re/ui-kit/icons/panel';
import TopIcon from '@re/ui-kit/icons/ranking';
import SettingsIcon from '@re/ui-kit/icons/settings';
import TargetIcon from '@re/ui-kit/icons/target';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { Separator } from '@re/ui-kit/ui/separator';
import { Switch } from '@re/ui-kit/ui/switch';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { AuthService } from '~entities/user/model/lib';
import { useNewVersionTour } from '~features/(tour)/new-version-tour';
import {
  UserAuthButtonMenuItem,
  UserBalanceMenuItem,
  UserDetailMenuItem,
  UserPublishers,
  UserSubscriptionMenuItem,
  YearSummaryMenuItem,
} from '~features/account/ui/menu';
import { HalloweenMenuItem } from '~features/halloween-menu-item';
import { SnowSwitch } from '~features/snow/snow-switch';
import { ShopItemTypes } from '~shared/api/models/shop';
import { FeatureFlagBoundary, Features } from '~shared/config/feature-flags';
import { Routing } from '~shared/config/routing';
import { useAccountModal } from '~shared/lib/account/use-account-modal';
import { AuthorizedLink } from '~shared/lib/auth/authorized-link';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { TourItemContainer } from '~shared/lib/tour/items';
import { Drawer, DrawerContent, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';
import { CookieService } from '~shared/utils/cookie-service';
import { publicEnv } from '~shared/utils/env';

interface AccountMobileProps {
  children: ReactNode;
}

export const AccountMobile = (props: AccountMobileProps) => {
  const { isOpen, close, open } = useAccountModal();
  const t = useTranslations('reusable');

  const contentType = useContentType();
  const session = useSession()!;
  const event = getEvent();
  const isLogged = !!session;
  const isNewYear = event === EventDateType.NEW_YEAR;
  const isHalloween = event === EventDateType.HALLOWEEN;
  const { features } = useSiteConfig()!;
  const pathname = usePathname();

  const { setTheme, resolvedTheme } = useTheme();

  const handleToggleTheme = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleStartTour = useNewVersionTour();

  const handleToggleSiteVersion = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    CookieService.set('site-version', 'old');
    window.location.href = '/';
  };

  // make tutorial popover clickable
  React.useEffect(() => {
    setTimeout(() => (document.body.style.pointerEvents = ''));
  }, [isOpen]);

  React.useEffect(() => {
    close();
  }, [pathname]);

  return (
    <Drawer direction="right" onOpenChange={(v) => (v ? open() : close())} open={isOpen}>
      <DrawerTrigger asChild>{props.children}</DrawerTrigger>
      <DrawerContent
        className={cn(
          'cs-account-menu border-l-border bg-background mx-[-1px] mt-0 ml-[20%] flex h-full w-[80%] flex-col rounded-[0] border border-l-2 border-none'
        )}
        hideSwipeElement
      >
        <DrawerTitle className="sr-only">Меню пользователя</DrawerTitle>
        <div className={cn('mx-auto flex w-full flex-col gap-4 overflow-y-auto px-6 py-4 pb-8')}>
          {isLogged ? (
            <>
              <UserDetailMenuItem />
              <UserPublishers />
              <Separator />
              <UserBalanceMenuItem />
            </>
          ) : (
            <UserAuthButtonMenuItem />
          )}
          <div className="flex flex-col gap-2">
            {isNewYear ? <YearSummaryMenuItem /> : null}

            <AuthorizedLink prefetch={false} href={Routing.User.bookmarks({ query: {} })}>
              <Button className="justify-start px-0" startIcon={<Bookmarks />} variant="ghost">
                Закладки
              </Button>
            </AuthorizedLink>
            <AuthorizedLink
              prefetch={false}
              className="flex items-center justify-between"
              href={Routing.User.notifications({ params: { tab: '0' } })}
            >
              <Button
                className="justify-start px-0"
                startIcon={
                  <div className="relative">
                    <Notification size={16} />
                    {session?.count_notifications ? (
                      <span className="size-xs bg-primary absolute -top-[2px] -right-[2px] rounded-full" />
                    ) : null}
                  </div>
                }
                variant="ghost"
              >
                Уведомления
              </Button>
              {session?.count_notifications ? (
                <Badge color="secondary" className="border-border border">
                  {session.count_notifications >= 100 ? '99+' : session.count_notifications}
                </Badge>
              ) : undefined}
            </AuthorizedLink>
            {features[Features.CHAT] ? (
              <AuthorizedLink
                prefetch={false}
                href={Routing.User.chat({})}
                className="flex items-center gap-2"
              >
                <Button className="justify-start px-0" startIcon={<MessageIcon />} variant="ghost">
                  Чат
                </Button>
                <Badge>Новое</Badge>
              </AuthorizedLink>
            ) : null}

            {isLogged ? (
              <>
                <Separator />
                <UserSubscriptionMenuItem />
                {isHalloween && <HalloweenMenuItem />}
                {features.BATTLEPASS ? (
                  <Button
                    asChild
                    className="justify-start px-0"
                    startIcon={<Medal />}
                    variant="ghost"
                  >
                    <Link shallow={false} prefetch={false} href={Routing.User.Battlepass.info()}>
                      Re: Pass
                    </Link>
                  </Button>
                ) : null}
              </>
            ) : null}

            <Accordion type="multiple" className="flex flex-col gap-2" defaultValue={['default']}>
              <AccordionItem value="include">
                <AccordionHeader>
                  <AccordionTrigger className="h-[36px]">
                    <div className="flex gap-2">
                      <MenuIcon size={16} />
                      <ReText align="left" size="sm">
                        Каталог
                      </ReText>
                    </div>
                    <AccordionIndicator />
                  </AccordionTrigger>
                </AccordionHeader>

                <AccordionContent
                  className="flex flex-col gap-2"
                  data-testid="catalog-filters-container"
                >
                  <Link
                    shallow={false}
                    prefetch={false}
                    href={Routing.Title.catalog({
                      params: { content: contentType },
                    })}
                  >
                    <Button className="justify-start px-0" variant="ghost">
                      Тайтлов
                    </Button>
                  </Link>
                  <Link shallow={false} prefetch={false} href={Routing.Card.catalog()}>
                    <Button className="justify-start px-0" variant="ghost">
                      Карт
                    </Button>
                  </Link>
                  {features[Features.SHORTS] ? (
                    <Link shallow={false} prefetch={false} href={Routing.Moment.shorts()}>
                      <Button className="justify-start gap-2 px-0" variant="ghost">
                        Шортсы <Badge>Новое</Badge>
                      </Button>
                    </Link>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Link
              shallow={false}
              prefetch={false}
              href={Routing.Forum.Feed.get({
                query: {
                  week: false,
                  ordering: '-id',
                  // exclude_tag: [12, 13, 14],
                },
              })}
            >
              {features[Features.FORUM] && (
                <Button className="justify-start px-0" startIcon={<ForumIcon />} variant="ghost">
                  Форум
                </Button>
              )}
            </Link>

            {isLogged ? (
              <>
                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<HistoryIcon />}
                  variant="ghost"
                >
                  <AuthorizedLink href={Routing.User.history()}>История чтения</AuthorizedLink>
                </Button>

                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<Feedback />}
                  variant="ghost"
                >
                  <AuthorizedLink href={Routing.Feedback.main()}>Обратная связь</AuthorizedLink>
                </Button>
              </>
            ) : null}

            <Separator />

            <TourItemContainer id="profile-menu-shop-item">
              {(props) => (
                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<TargetIcon />}
                  variant="ghost"
                  {...props}
                >
                  <AuthorizedLink
                    prefetch={false}
                    href={Routing.Shop.catalog({
                      params: {
                        tab: 'feed',
                        type: ShopItemTypes.AVATAR,
                      },
                    })}
                  >
                    Магазин
                  </AuthorizedLink>
                </Button>
              )}
            </TourItemContainer>
            <Accordion type="multiple" className="flex flex-col gap-2" defaultValue={['default']}>
              <AccordionItem value="include">
                <AccordionHeader>
                  <AccordionTrigger className="h-[36px]">
                    <div className="flex gap-2">
                      <TopIcon size={16} />
                      <ReText align="left" size="sm">
                        Топы
                      </ReText>
                    </div>
                    <AccordionIndicator />
                  </AccordionTrigger>
                </AccordionHeader>

                <AccordionContent
                  className="flex flex-col gap-2"
                  data-testid="catalog-filters-container"
                >
                  <Link
                    shallow={false}
                    prefetch={false}
                    href={Routing.Title.top({
                      params: { content: contentType },
                    })}
                  >
                    <Button className="justify-start px-0" variant="ghost">
                      Тайтлов
                    </Button>
                  </Link>

                  <Link shallow={false} prefetch={false} href={Routing.User.top()}>
                    <Button className="justify-start px-0" variant="ghost">
                      Пользователей
                    </Button>
                  </Link>
                  <Link shallow={false} prefetch={false} href={Routing.Club.top()}>
                    <Button className="justify-start px-0" variant="ghost">
                      Гильдий
                    </Button>
                  </Link>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {session?.is_staff ? (
              <>
                <Separator />

                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<AdminIcon />}
                  variant="ghost"
                >
                  <StaffOnlyLink prefetch={false} href={publicEnv('ADMIN_URL')}>
                    Админка
                  </StaffOnlyLink>
                </Button>

                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<PanelIcon />}
                  variant="ghost"
                >
                  <StaffOnlyLink href={publicEnv('PANEL_URL')}>Модерка</StaffOnlyLink>
                </Button>
              </>
            ) : null}

            {isLogged ? (
              <>
                <Separator />
                <Button
                  asChild
                  className="justify-start px-0"
                  startIcon={<SettingsIcon />}
                  variant="ghost"
                >
                  <Link
                    prefetch={false}
                    href={Routing.User.settings({ params: { tab: 'profile' } })}
                  >
                    Настройки
                  </Link>
                </Button>
                {/*<Button*/}
                {/*  {...TestProps.id(`promo_menu_btn`)}*/}
                {/*  className="justify-start px-0"*/}
                {/*  startIcon={<Gift />}*/}
                {/*  variant="ghost"*/}
                {/*>*/}
                {/*  <Link prefetch={false} shallow={false} href={Routing.User.promocode({})}>*/}
                {/*    {t('entities.inventory-items.promo-codes')}*/}
                {/*  </Link>*/}
                {/*</Button>*/}

                <Button
                  {...TestProps.id(`promo_menu_btn`)}
                  className="justify-start px-0"
                  startIcon={<BillingIcon />}
                  variant="ghost"
                >
                  <Link shallow={false} prefetch={false} href={Routing.User.billing()}>
                    {t('entities.transactions.title')}
                  </Link>
                </Button>

                <Button asChild className="justify-start px-0" startIcon={<Form />} variant="ghost">
                  <Link prefetch={false} shallow={false} href={Routing.User.requests({})}>
                    Мои заявки
                  </Link>
                </Button>
                <Accordion
                  type="multiple"
                  className="flex flex-col gap-2"
                  defaultValue={['default']}
                >
                  <AccordionItem value="include">
                    <AccordionHeader>
                      <AccordionTrigger
                        {...TestProps.id(`add_content_menu_btn`)}
                        className="h-[36px]"
                      >
                        <div className="flex gap-2">
                          <EditIcon size={16} />
                          <ReText align="left" size="sm">
                            Добавить контент
                          </ReText>
                        </div>
                        <AccordionIndicator />
                      </AccordionTrigger>
                    </AccordionHeader>

                    <AccordionContent
                      className="flex flex-col gap-2"
                      data-testid="catalog-filters-container"
                    >
                      <Button
                        {...TestProps.id(`add_title_menu_btn`)}
                        className="justify-start px-0"
                        asChild
                        variant="ghost"
                      >
                        <Link
                          shallow={false}
                          prefetch={false}
                          href={Routing.Title.add({
                            params: { content: contentType },
                          })}
                        >
                          Тайтл
                        </Link>
                      </Button>
                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_team_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Publisher.add()}>
                          Команду
                        </Link>
                      </Button>
                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_guild_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Club.add()}>
                          Гильдию
                        </Link>
                      </Button>
                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_character_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Character.add()}>
                          Персонажа
                        </Link>
                      </Button>
                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_creator_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Creator.add()}>
                          Создателя
                        </Link>
                      </Button>
                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_card_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link
                          shallow={false}
                          prefetch={false}
                          href={Routing.Card.add({ query: {} })}
                        >
                          Карточку
                        </Link>
                      </Button>

                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_collection_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Collection.add()}>
                          Коллекцию
                        </Link>
                      </Button>

                      <Button
                        className="justify-start px-0"
                        {...TestProps.id(`add_quiz_menu_btn`)}
                        asChild
                        variant="ghost"
                      >
                        <Link shallow={false} prefetch={false} href={Routing.Quiz.create()}>
                          Квиз
                        </Link>
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : null}

            <Separator />

            {session ? (
              <TourItemContainer id="profile-menu-guide">
                {(props) => (
                  <Button
                    onClick={handleStartTour}
                    className="justify-start px-0"
                    variant="ghost"
                    {...props}
                  >
                    Пройти гайд
                  </Button>
                )}
              </TourItemContainer>
            ) : null}

            <Separator />
            <div
              className="flex w-full items-center justify-between py-3"
              onClick={handleToggleTheme}
              {...TestProps.id(`theme_menu_btn`)}
            >
              Тёмная тема
              <Switch checked={resolvedTheme === 'dark'} />
            </div>

            {isNewYear ? <SnowSwitch /> : null}

            <FeatureFlagBoundary name={Features.OLD_VERSION_SWITCH}>
              <Button
                variant="ghost"
                startIcon={<Cycle />}
                className="justify-start px-0"
                onClick={handleToggleSiteVersion}
              >
                Вернуться на старую версию
              </Button>
            </FeatureFlagBoundary>
            {isLogged ? (
              <>
                <Separator />
                <Button
                  className="text-destructive justify-start px-0"
                  startIcon={<LogoutIcon />}
                  variant="ghost"
                  onClick={() => AuthService.logout()}
                >
                  Выйти
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
