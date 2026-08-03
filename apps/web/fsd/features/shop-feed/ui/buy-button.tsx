'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import Activity from '@re/ui-kit/icons/activity';
import ArrowRight from '@re/ui-kit/icons/arrow-right';
import Ticket from '@re/ui-kit/icons/ticket';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useBuyShopItemMutation } from '~entities/shop/model/mutations';
import {
  getCustomizationInventoryType,
  getInventoryUrl,
  getItemStatus,
  getItemType,
  hasEnoughFunds,
  ShopItemStatus,
} from '~entities/shop/model/utils';
import { changeSessionParamsLocally } from '~entities/user/model/mutations';
import { ShopItemSchema, ShopItemTypes } from '~shared/api/models/shop';
import { DetailedCurrentUserSchema } from '~shared/api/models/user';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { useSession } from '~shared/lib/session/use-session';
import { LinkBase } from '~shared/ui/link-base';
import { importToastAsync } from '~shared/ui/toast/toast.async';

interface StatusActionShopItem extends Omit<ButtonProps, 'children'> {
  shopItem: ShopItemSchema;
  currency?: 'coins' | 'tickets';
  onSuccess?: () => void;
}

interface BuyButtonProps extends Omit<ButtonProps, 'children'> {
  shopItem: ShopItemSchema;
  resolvedType: ShopItemTypes;
  status: Omit<ShopItemStatus, 'unavailable-at-all' | 'unavailable-by-date' | 'owned'>;
  currency?: 'coins' | 'tickets';
  onSuccess?: () => void;
  user: DetailedCurrentUserSchema;
}

const BuyButton = ({
  shopItem,
  className,
  onSuccess,
  resolvedType,
  user: { ticket_balance: userTicketBalance, coins: userCoins, id: userId },
  currency = 'coins',
  ...props
}: BuyButtonProps) => {
  const t = useTranslations('pages.customization-items-page.content');

  const tInventory = useTranslations('reusable.entities.inventory-items');
  const { mutateAsync, isPending } = useBuyShopItemMutation(resolvedType, shopItem.dir);
  const status = getItemStatus(shopItem);
  const checkLogged = useLoggedCheck();

  const handleBuy = checkLogged(async () => {
    if (status === 'owned') return;

    const toast = await importToastAsync();
    try {
      await mutateAsync({ shopItemId: shopItem.id, currency });
      onSuccess?.();

      changeSessionParamsLocally((user) => ({
        ...user,
        coins: Math.max(user.coins ?? 0 - (currency === 'coins' ? shopItem.cost : 0), 0),
        ticket_balance: Math.max(
          user.ticket_balance ?? 0 - (currency === 'tickets' ? shopItem.cost_tickets : 0),
          0
        ),
      }));

      const inventoryUrl = getInventoryUrl(shopItem, userId);
      toast.success(
        t.rich('actions.subject-in', {
          type: tInventory(getCustomizationInventoryType(resolvedType)),
          inventoryLink: (chunks) => (
            <Link href={inventoryUrl} className="underline" target="_blank">
              {chunks}
            </Link>
          ),
          typeLink: (chunks) => <span className="font-medium">{chunks}</span>,
        })
      );
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  if (status === 'free') {
    return (
      <Button className={className} onClick={handleBuy} disabled={isPending} {...props}>
        {t('status.take-free')}
      </Button>
    );
  }
  const hasMoney = hasEnoughFunds(shopItem, currency, {
    ticket_balance: userTicketBalance,
    coins: userCoins,
  });

  return (
    <Button className={className} onClick={handleBuy} disabled={isPending || !hasMoney} {...props}>
      {hasMoney ? t('status.purchase') : t('status.not-enough')}
      {!hasMoney && (
        <span className="ml-2 flex">
          {currency === 'tickets'
            ? (shopItem.cost_tickets ?? 0 - (userTicketBalance ?? 0))
            : (shopItem.cost ?? 0 - (userCoins ?? 0))}
          {currency === 'tickets' ? (
            <Ticket className="ml-1 inline" />
          ) : (
            <Activity className="ml-1 inline" />
          )}
        </span>
      )}
    </Button>
  );
};
export const PurchaseActionShopItem = ({ className, shopItem, ...props }: StatusActionShopItem) => {
  const user = useSession();
  const stats = getItemStatus(shopItem);
  const type = getItemType(shopItem);
  const [is_bought, setIsBought] = useState(stats && stats === 'owned');
  const onPurchase = () => {
    setIsBought(true);
  };
  const t = useTranslations('pages.customization-items-page.content');
  if (!stats) return null;
  if (!type) return null;
  if (!user) return null;
  const status = getItemStatus(shopItem);
  if (status === 'unavailable-at-all' || status === 'unavailable-by-date') {
    return (
      <Button
        className={cn('pointer-events-none cursor-auto', className)}
        disabled
        variant="outline"
        {...props}
      >
        {t('status.unavailable')}
      </Button>
    );
  }
  if (status === 'owned' || is_bought) {
    const inventoryUrl = getInventoryUrl(shopItem, user.id);
    return (
      <LinkBase className={cn(className, 'flex h-9 items-center')} key="owned" variant="default">
        <Link prefetch={false} href={inventoryUrl}>
          {t('status.in-inventory')}
          <ArrowRight className="mt-[2px] ml-2" />
        </Link>
      </LinkBase>
    );
  }
  return (
    <BuyButton
      onSuccess={onPurchase}
      resolvedType={type}
      {...props}
      user={user}
      shopItem={shopItem}
      className={className}
      status={status}
    />
  );
};
