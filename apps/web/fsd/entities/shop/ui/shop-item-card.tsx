'use client';

import React, { ComponentProps, ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { createContext } from '@re/core/utils/create-context';
import Activity from '@re/ui-kit/icons/activity';
import SoonClock from '@re/ui-kit/icons/clock-soon';
import YetClock from '@re/ui-kit/icons/clock-yet';
import Ticket from '@re/ui-kit/icons/ticket';
import { Badge } from '@re/ui-kit/ui/badge';
import type { TextProps } from '@re/ui-kit/ui/text';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import DAYJS from 'dayjs';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { shopLocalMutation } from '~entities/shop/model/mutations';
import {
  getItemCost,
  getItemCover,
  getItemCurrency,
  getItemName,
  getItemStatus,
  getItemType,
  ShopItemStatus,
} from '~entities/shop/model/utils';
import { useShopItemByDateStatus } from '~entities/shop/ui/dates';
import { ShopItemImage } from '~entities/shop/ui/shop-item-image';
import type { ShopItemSchema } from '~shared/api/models/shop';
import { Routing } from '~shared/config/routing';
import { OtpTimer } from '~shared/lib/timer/model/otp-timer';
import { fallbackEmpty } from '~shared/seo/fallback-empty';
import type { FooterLabelType, FooterType } from '~shared/ui/item-card';
import * as ItemCard from '~shared/ui/item-card';
import { UrlFormatter } from '~shared/utils/url-formatter';

DAYJS.extend(duration);
DAYJS.extend(utc);
DAYJS.extend(timezone);
type ShopItemStoreParams = {
  model: ShopItemSchema;
  fallbackDisplayName?: string;
  currency?: 'tickets' | 'coins';
};
type ShopItemStore = {
  model: ShopItemSchema;
  computed: {
    resolvedCost: number | null;
    referencedCurrency: 'tickets' | 'coins';
    status: ShopItemStatus;
    source: string;
    type: ReturnType<typeof getItemType>;
    displayName: string;
  };
};
/**
 * availability_end_date и availability_start_date приводятся к формате с tz +03:00
 */
export const {
  Provider: ShopItemProvider,
  useStore: useShopCardStore,
  Consumer: ShopItemConsumer,
} = createContext<ShopItemStore, ShopItemStoreParams>(
  ({ model, fallbackDisplayName, currency }) => {
    return {
      model,
      computed: {
        resolvedCost: getItemCost(model, currency ?? getItemCurrency(model)),
        referencedCurrency: getItemCurrency(model),
        status: getItemStatus(model),
        source: UrlFormatter.media(getItemCover(model)),
        type: getItemType(model),
        displayName: getItemName(model, fallbackDisplayName),
      },
    };
  }
);

export const ShopItemCard = ({
  children,
  shopItem,
  currency,
  fallbackDisplayName,
  ...props
}: ItemCard.RootProps & {
  shopItem: ShopItemSchema;
  fallbackDisplayName?: string;
  currency?: 'tickets' | 'coins';
}) => {
  return (
    <ItemCard.Root variant="solid" {...props}>
      <ShopItemProvider value={{ model: shopItem, currency, fallbackDisplayName }}>
        {children}
      </ShopItemProvider>
    </ItemCard.Root>
  );
};

export const ShopItemCardContent = ItemCard.Content;
export const ShopItemFooter = ({ children, className, ...other }: FooterType) => (
  <ItemCard.Footer {...other} className={cn('gap-2 px-1.5 pb-0', className)}>
    {children}
  </ItemCard.Footer>
);

export const ShopItemTypeLabel = (props: Omit<FooterLabelType, 'children'>) => {
  const type = useShopCardStore((v) => v.computed.type);
  const t = useTranslations('reusable.entities.shop-customization-items');
  if (!type) return null;
  return (
    <ItemCard.Label key={type} size="sm" weight="medium" color="muted-foreground" {...props}>
      {t(type)}
    </ItemCard.Label>
  );
};

export const ShopItemCount = ({ className, ...other }: { className?: string } & TextProps) => {
  const amount = useShopCardStore((v) => v.model.amount);
  const status = useShopCardStore((v) => v.computed.status);
  if (status === 'unavailable-by-date' || status === 'unavailable-at-all') {
    return null;
  }

  return (
    <ReText
      size="sm"
      weight="medium"
      color="muted-foreground"
      className={`${className}${amount !== null ? 'mt-0' : ''}`}
      {...other}
    >
      {amount !== null ? `${amount} шт` : ''}
    </ReText>
  );
};

export const ShopItemAuthor = ({ prefix }: { prefix?: string }) => {
  const authorName = useShopCardStore((v) => v.model.image_item?.author?.username);
  const authorId = useShopCardStore((v) => v.model.image_item?.author?.id);
  if (!authorId || !authorName) return null;
  return (
    <Link
      shallow={false}
      prefetch={false}
      target="_blank"
      href={Routing.User.detail({ params: { id: authorId } })}
    >
      <Badge variant="outline">
        {prefix || ''} {authorId}
      </Badge>
    </Link>
  );
};

export const ShopItemAvailabilityWithoutReasons = (props: TextProps) => {
  const status = useShopCardStore((v) => v.computed.status);
  const t = useTranslations('pages.customization-items-page.content');
  if (status !== 'unavailable-at-all') return null;
  return (
    <ReText size="xs" color="muted-foreground" {...props}>
      {t('status.not-available-in-shop')}
    </ReText>
  );
};

export const ShopItemAvailabilityDate = ({
  setItem,
  className,
  ...props
}: TextProps & {
  setItem?: (item: Partial<ShopItemSchema>) => void;
}) => {
  const t = useTranslations('pages.customization-items-page.content.times-types');
  const status = useShopCardStore((v) => v.computed.status);
  const endDate = useShopCardStore((v) => v.model.availability_end_date);
  const type = useShopCardStore((v) => v.computed.type);
  const id = useShopCardStore((v) => v.model.id);
  const startDate = useShopCardStore((v) => v.model.availability_start_date);
  const salesStatus = useShopItemByDateStatus({ endDate, startDate });
  if (!endDate && !startDate) return null;
  if (status === 'unavailable-by-date' && salesStatus === 'infinite-or-past') {
    return <ShopItemAvailabilityPast className={className} />;
  }
  const dateField =
    salesStatus === 'soon' && startDate
      ? 'startDate'
      : salesStatus === 'yet' && endDate
        ? 'endDate'
        : null;
  const onComplete = async () => {
    setItem?.({
      [dateField === 'startDate' ? 'availability_start_date' : 'availability_end_date']: null,
    });
    await shopLocalMutation({
      shopItemId: id,
      type,
      mutateFn: () => ({
        [dateField === 'startDate' ? 'availability_start_date' : 'availability_end_date']: null,
      }),
    });
  };
  const targetDate = salesStatus === 'yet' ? endDate : salesStatus === 'soon' ? startDate : null;
  if (!targetDate) return null;
  const Icon = salesStatus === 'yet' ? YetClock : SoonClock;
  return (
    <div className={cn('mx-auto self-center', className)}>
      <span className="mb-2 flex items-center gap-2">
        <Icon />
        <ReText>{t(`labels.${salesStatus}`)}</ReText>
      </span>
      <OtpTimer onComplete={onComplete} {...props} targetDate={targetDate} />
    </div>
  );
};
export const ShopItemAvailabilityPast = (props: TextProps) => {
  const endDate = useShopCardStore((v) => v.model.availability_end_date);
  const startDate = useShopCardStore((v) => v.model.availability_start_date);
  const datetimeFormat = useSiteConfig((v) => v.localization.dateFormat);
  const t = useTranslations('pages.customization-items-page.content');

  if (!endDate && !startDate) return null;

  return (
    <ReText size="xs" color="muted-foreground" {...props}>
      {t('status.unavailable-by-date', {
        startDate: startDate ? dayjs(startDate).format(datetimeFormat) : fallbackEmpty(startDate),
        endDate: endDate ? dayjs(endDate).format(datetimeFormat) : fallbackEmpty(endDate),
      })}
    </ReText>
  );
};

export const ShopItemCost = ({ className, ...props }: ComponentProps<'div'>) => {
  const { cost, cost_tickets } = useShopCardStore((v) => v.model);
  const status = useShopCardStore((v) => v.computed.status);
  const t = useTranslations('pages.customization-items-page.content');
  if (status === 'unavailable-by-date' || status === 'unavailable-at-all') {
    return (
      <Badge variant="outline" className={cn('-mr-1', className)} {...props}>
        {t('status.unavailable')}
      </Badge>
    );
  }
  if (status === 'owned') {
    return (
      <Badge variant="outline" className={cn('-mr-1', className)} {...props}>
        {t('status.owned')}
      </Badge>
    );
  }
  if (status === 'available' || status === 'free' || status === 'out-of-stock') {
    const Icon = cost_tickets ? Ticket : Activity;
    return (
      <span className={cn('flex items-center', className)} {...props}>
        <Icon className="mr-1 size-4" />
        <ItemCard.Label
          align="center"
          size="sm"
          weight={cost_tickets ? 'medium' : 'bold'}
          color="muted-foreground"
        >
          {status === 'free' ? 0 : cost_tickets || cost}
        </ItemCard.Label>
      </span>
    );
  }
  return null;
};

export const ShopItemCardImage = ({
  avatarSrc,
  className,
  imgClassName,
  frameSrc,
  children,
  preview,
  withAvatarFallback = true,
}: {
  preview?: boolean;
  withAvatarFallback?: boolean;
  frameSrc: string | null;
  avatarSrc: string | null;
  className?: string;
  imgClassName?: string;
  children?: ReactNode;
}) => {
  const source = useShopCardStore((v) => v.computed.source);
  const name = useShopCardStore((v) => v.computed.displayName);
  const type = useShopCardStore((v) => v.computed.type);
  return (
    <ShopItemImage
      withAvatarFallback={withAvatarFallback}
      preview={preview}
      className={imgClassName}
      containerClassName={className}
      avatarSrc={avatarSrc}
      frameSrc={frameSrc}
      type={type}
      children={children}
      alt={name}
      imgSrc={source}
    />
  );
};
