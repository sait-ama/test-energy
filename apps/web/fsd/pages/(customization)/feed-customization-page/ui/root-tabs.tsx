'use client';

import * as React from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Switch } from '@re/ui-kit/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { ActivityFAQ } from '~entities/shop/ui/faq';
import { CoinsBalance } from '~entities/user/ui/coins-balance';
import { useExcludeShopFragmentsStore } from '~features/shop-feed/model/store';
import {
  ShopItemTypes,
  ShopPaginatedListOrderings,
  ShopPaginatedListOrderingValues,
} from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { useLogged } from '~shared/lib/session/use-logged';
import { RouterMenuSelect } from '~shared/ui/router-menu/ui/router-menu-select';

const options = [
  // { value: SHOP_ITEM_TYPE.ALL, label: 'Все' },
  { value: ShopItemTypes.AVATAR, label: 'Аватарки' },
  { value: ShopItemTypes.WALLPAPER, label: 'Обои' },
  { value: ShopItemTypes.FRAME, label: 'Рамки' },
  { value: ShopItemTypes.THEME, label: 'Темы профиля' },
  { value: ShopItemTypes.PACK, label: 'Эмодзи' },
] satisfies { value: ShopItemTypes; label: string }[];

const Toggler = ({ type, className }: { type: ShopItemTypes; className?: string }) => {
  const { setEx, avatar: withAvatar, frame: withFrame } = useExcludeShopFragmentsStore((v) => v);

  if (type !== ShopItemTypes.AVATAR && type !== ShopItemTypes.FRAME) return null;

  const text =
    type === ShopItemTypes.FRAME ? 'Аватарка' : type === ShopItemTypes.AVATAR ? 'Рамка' : '';

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <ReText htmlFor="shop-toggler" size="sm" component="label">
        {text}
      </ReText>
      <Switch
        id="shop-toggler"
        defaultChecked
        checked={
          type === ShopItemTypes.FRAME ? withAvatar : ShopItemTypes.AVATAR ? withFrame : false
        }
        onCheckedChange={(v) => {
          setEx({
            avatar: type === ShopItemTypes.FRAME ? v : true,
            frame: type === ShopItemTypes.AVATAR ? v : true,
          });
        }}
      />
    </span>
  );
};

export const RootTabs = ({
  children,
  className,
  asChild,
}: {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();
  const type = (pathname.split('/').at(-1) as ShopItemTypes) || ShopItemTypes.AVATAR; // because deck has static path
  const router = useRouter();
  const logged = useLogged();
  const onChange = (tab: string) => {
    router.push(Routing.Shop.catalog({ params: { tab: 'feed', type: tab as ShopItemTypes } }));
  };

  return (
    <Tabs
      activationMode="manual"
      asChild={asChild}
      className={className}
      value={type}
      onValueChange={(value) => {
        onChange(value);
      }}
    >
      <div className="flex flex-wrap justify-between gap-2">
        <ScrollArea className="w-full sm:w-auto">
          <TabsList className="flex justify-evenly sm:justify-start">
            {options.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
            {/*<div className="bg-secondary flex h-[28px] w-[2px] items-center rounded-sm" />*/}
            <TabsTrigger value="deck">Колоды</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <span className="flex w-full items-center justify-between gap-2 sm:w-auto">
          {type !== ShopItemTypes.DECK ? (
            <RouterMenuSelect
              className="w-[170px]"
              defaultValue={ShopPaginatedListOrderings.CHEAP}
              fieldName="ordering"
              options={ShopPaginatedListOrderingValues}
            />
          ) : null}
        </span>
      </div>

      <div className="flex w-full items-center justify-between">
        <CoinsBalance />

        {logged ? (
          <div className="flex items-center gap-2">
            <ActivityFAQ />
            <Toggler type={type} className="bg-secondary rounded-md p-2 pl-3.5" />
          </div>
        ) : null}
      </div>
      {children}
    </Tabs>
  );
};
