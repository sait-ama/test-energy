'use client';
import { memo, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Admin from '@re/ui-kit/icons/admin';
import BillingIcon from '@re/ui-kit/icons/billing';
import Feedback from '@re/ui-kit/icons/feedback';
import Form from '@re/ui-kit/icons/form';
import History from '@re/ui-kit/icons/history';
import Logout from '@re/ui-kit/icons/logout';
import Medal from '@re/ui-kit/icons/medal';
import Panel from '@re/ui-kit/icons/panel';
import Settings from '@re/ui-kit/icons/settings';
import Target from '@re/ui-kit/icons/target';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { AuthService } from '~entities/user/model/lib';
import { useNewVersionTour } from '~features/(tour)/new-version-tour';
import {
  ToggleThemeMenuItem,
  ToggleVersionMenuItem,
  UserAuthButtonMenuItem,
  UserBalanceMenuItem,
  UserClubs,
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
import { useOnReroute } from '~shared/hooks/use-on-reroute';
import { useAccountModal } from '~shared/lib/account/use-account-modal';
import { StaffOnlyLink } from '~shared/lib/auth/staff-only-link';
import { EventDateType, getEvent } from '~shared/lib/event-management/get-event';
import { useLogged } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { TestProps } from '~shared/lib/test/utils/test-props';
import { TourItemContainer, useTourItem } from '~shared/lib/tour/items';
import { publicEnv } from '~shared/utils/env';

interface AccountDesktopProps {
  children: ReactNode;
}

export const AccountDesktop = memo((props: AccountDesktopProps) => {
  const t = useTranslations('reusable');
  const { isOpen, open, close } = useAccountModal();
  const user = useSession();
  const event = getEvent();
  const siteConfig = useSiteConfig()!;
  const showPremium = !!user?.can_buy_premium_type;
  const profileMenuContentTourProps = useTourItem('profile-menu-content');

  const handleStartTour = useNewVersionTour();
  useOnReroute(close);
  // make tutorial popover clickable
  useEffect(() => {
    setTimeout(() => (document.body.style.pointerEvents = ''));
  }, [isOpen]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <DropdownMenuTrigger asChild>{props.children}</DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="cs-account-menu w-80"
        {...profileMenuContentTourProps}
      >
        <ScrollArea>
          <div className="max-h-[89vh]">
            <DropdownMenuItem asChild>
              <UserDetailMenuItem />
            </DropdownMenuItem>
            <UserPublishers className="px-3" />
            <DropdownMenuSeparator />

            <UserClubs />

            <DropdownMenuItem>
              <UserBalanceMenuItem />
            </DropdownMenuItem>
            <div className="my-2 px-4" />
            <DropdownMenuSeparator />
            <UserSubscriptionMenuItem />
            {event === EventDateType.HALLOWEEN && <HalloweenMenuItem />}
            {showPremium ? <DropdownMenuSeparator /> : null}
            <DropdownMenuGroup>
              {siteConfig.features.BATTLEPASS ? (
                <DropdownMenuItem
                  asChild
                  {...TestProps.id(`repass_menu_btn`)}
                  className="flex justify-between"
                >
                  <Link shallow={false} prefetch={false} href={Routing.User.Battlepass.info()}>
                    Re: Pass
                    <Medal size={20} />
                  </Link>
                </DropdownMenuItem>
              ) : null}
              {event === EventDateType.NEW_YEAR ? (
                <DropdownMenuItem asChild className="flex justify-between">
                  <YearSummaryMenuItem />
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem
                {...TestProps.id(`history_menu_btn`)}
                asChild
                className="flex justify-between"
              >
                <Link shallow={false} prefetch={false} href={Routing.User.history()}>
                  История чтения <History size={20} />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex justify-between">
                <Link shallow={false} prefetch={false} href={Routing.User.requests({})}>
                  Мои заявки
                  <Form size={20} />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="flex justify-between">
                <Link shallow={false} prefetch={false} href={Routing.Feedback.main()}>
                  Обратная связь
                  <Feedback size={20} />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Добавить контент</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent
                    className="cs-account-menu-sublist"
                    sideOffset={2}
                    alignOffset={-5}
                  >
                    <DropdownMenuItem {...TestProps.id(`add_title_menu_btn`)} asChild>
                      <Link
                        shallow={false}
                        prefetch={false}
                        href={Routing.Title.add({
                          params: { content: siteConfig?.contentType },
                        })}
                      >
                        Тайтл
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_team_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Publisher.add()}>
                        Команду
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_guild_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Club.add()}>
                        Гильдию
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_character_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Character.add()}>
                        Персонажа
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_creator_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Creator.add()}>
                        Создателя
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_card_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Card.add({ query: {} })}>
                        Карточку
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_collection_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Collection.add()}>
                        Коллекцию
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem {...TestProps.id(`add_quiz_menu_btn`)} asChild>
                      <Link shallow={false} prefetch={false} href={Routing.Quiz.create()}>
                        Квиз
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="flex justify-between">
                <StaffOnlyLink href={publicEnv('PANEL_URL')}>
                  Модерка
                  <Panel size={20} />
                </StaffOnlyLink>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="flex justify-between">
                <StaffOnlyLink prefetch={false} href={publicEnv('ADMIN_URL')}>
                  Админка
                  <Admin size={20} />
                </StaffOnlyLink>
              </DropdownMenuItem>

              {user?.is_staff ? <DropdownMenuSeparator /> : null}
              <TourItemContainer id="profile-menu-shop-item">
                {(props) => (
                  <DropdownMenuItem
                    {...TestProps.id(`shop_menu_btn`)}
                    asChild
                    className="flex justify-between"
                    {...props}
                  >
                    <Link
                      shallow={false}
                      prefetch={false}
                      href={Routing.Shop.catalog({
                        params: {
                          tab: 'feed',
                          type: ShopItemTypes.AVATAR,
                        },
                      })}
                    >
                      Магазин
                      <Target size={20} />
                    </Link>
                  </DropdownMenuItem>
                )}
              </TourItemContainer>
              <DropdownMenuItem
                asChild
                {...TestProps.id(`settings_menu_btn`)}
                className="flex justify-between"
              >
                <Link
                  shallow={false}
                  prefetch={false}
                  href={Routing.User.settings({ params: { tab: 'profile' } })}
                >
                  Настройки
                  <Settings size={20} />
                </Link>
              </DropdownMenuItem>
              {/*<DropdownMenuItem*/}
              {/*  {...TestProps.id(`promo_menu_btn`)}*/}
              {/*  asChild*/}
              {/*  className="flex justify-between"*/}
              {/*>*/}
              {/*  <Link shallow={false} prefetch={false} href={Routing.User.promocode()}>*/}
              {/*    {t('entities.inventory-items.promo-codes')}*/}
              {/*    <Gift />*/}
              {/*  </Link>*/}
              {/*</DropdownMenuItem>*/}
              <DropdownMenuItem
                {...TestProps.id(`promo_menu_btn`)}
                asChild
                className="flex justify-between"
              >
                <Link shallow={false} prefetch={false} href={Routing.User.billing()}>
                  {t('entities.transactions.title')}
                  <BillingIcon size={20} />
                </Link>
              </DropdownMenuItem>
              {user?.is_staff ? <DropdownMenuSeparator /> : null}

              <DropdownMenuItem>
                <ToggleThemeMenuItem />
              </DropdownMenuItem>

              {event === EventDateType.NEW_YEAR ? (
                <DropdownMenuItem>
                  <SnowSwitch />
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuSeparator />

              {user ? (
                <TourItemContainer id="profile-menu-guide">
                  {(props) => (
                    <DropdownMenuItem
                      onClick={handleStartTour}
                      className="flex justify-between"
                      {...props}
                    >
                      Пройти гайд
                    </DropdownMenuItem>
                  )}
                </TourItemContainer>
              ) : null}

              <DropdownMenuSeparator />

              <FeatureFlagBoundary name={Features.OLD_VERSION_SWITCH}>
                <DropdownMenuItem>
                  <ToggleVersionMenuItem />
                </DropdownMenuItem>
              </FeatureFlagBoundary>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => AuthService.logout()}
                {...TestProps.id(`exit_menu_btn`)}
                className="flex w-full items-center justify-between"
              >
                <ReText size="sm" color="destructive" leading="none">
                  Выйти
                </ReText>
                <Logout size={20} className="text-destructive" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </div>
          <ScrollBar />
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

interface AccountDesktopRootProps {
  children: ReactNode;
}

export const AccountDesktopRoot = (props: AccountDesktopRootProps) => {
  const logged = useLogged();

  if (!logged) return <UserAuthButtonMenuItem />;

  return props.children;
};
