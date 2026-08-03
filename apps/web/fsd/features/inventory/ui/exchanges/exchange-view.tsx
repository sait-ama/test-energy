'use client';

import { memo, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createQueryKey } from '@re/api/exports-core';
import {
  v2InventoryExchangesRetrieveInfiniteQueryKey,
  v2InventoryExchangesUpdateMutation,
} from '@re/api/generated/@tanstack/react-query.gen';
import type { Options } from '@re/api/generated/sdk.gen';
import { V2InventoryExchangesRetrieveData } from '@re/api/generated/types.gen';
import { Button } from '@re/ui-kit/ui/button';
import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { HeroCardSkeletonV2 } from '~entities/inventory/ui/hero-card';
import { client } from '~shared/api/client';
import type {
  ExchangeSchema,
  HeroCardItemSchema,
  InventoryExchangeCreateItemsSchema,
  UnifiedInventoryItemSchema,
  UnifiedInventoryItemTypeSchema,
} from '~shared/api/models/inventory';
import {
  ExchangeStatus,
  ExchangeStatusColorsMap,
  ExchangeStatusLabelsMap,
} from '~shared/api/models/inventory';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { useConfirmedAsyncAction } from '~shared/lib/submit-action/use-submit-action';
import { CarouselContent, CarouselItem, CarouselSkeleton } from '~shared/ui/carousel';
import { Input } from '~shared/ui/input';
import { adjustArrayLength } from '~shared/utils/adjust-array-length';

import { ExchangeCard } from './exchange-card';

const EXCHANGE_MAX_CARDS = 4;

export interface ExchangeViewProps {
  onStatusChange?: (status: ExchangeStatus) => void;
  className?: string;
  exchange: ExchangeSchema;
  ref?: React.RefObject<HTMLDivElement>;
}

const MessageInput = (props: { onChange: (message: string) => void; className?: string }) => {
  const { onChange, className } = props;
  const [message, setMessage] = useState('');

  return (
    <Input
      placeholder="Напишите сообщение пользователю"
      className={cn('mt-1', className)}
      value={message}
      onChange={(e) => {
        setMessage(e.target.value);
        onChange(e.target.value);
      }}
    />
  );
};

const getUnifiedItemList = (items: InventoryExchangeCreateItemsSchema) => {
  const unifiedItems: {
    type: UnifiedInventoryItemTypeSchema;
    model: UnifiedInventoryItemSchema;
  }[] = [];

  for (const key in items) {
    //@ts-ignore
    const modelArray = items[key] as UnifiedInventoryItemSchema[];

    try {
      unifiedItems.push(
        //@ts-ignore
        ...modelArray.map((model) => ({
          type:
            key === 'cards'
              ? ('card' as const)
              : (model as Exclude<UnifiedInventoryItemSchema, HeroCardItemSchema>).image_item.type,
          model: key === 'cards' ? { card: model } : model,
        }))
      );
    } catch {}
  }

  return unifiedItems;
};

export const ExchangeView = memo(
  ({ ref, ...props }: ExchangeViewProps) => {
    const { exchange, onStatusChange, className, ...rest } = props;
    const { partner, creator, items_creator, items_partner, status, id } = exchange || {};
    const currentUser = useSession();
    const t = useTranslations('inventory.exchanges');
    const queryClient = useQueryClient();
    const messageRef = useRef('');

    const [isPending, setIsPending] = useState(false);

    const { mutateAsync: changeStatus } = useMutation({
      ...v2InventoryExchangesUpdateMutation({ client }),
      onSuccess: async () => {
        const [targetKey] = v2InventoryExchangesRetrieveInfiniteQueryKey({
          path: {
            user_id: currentUser!.id,
          },
        });

        await queryClient.refetchQueries({
          predicate: ({
            queryKey: [currentKey],
          }: {
            queryKey: ReturnType<typeof createQueryKey<Options<V2InventoryExchangesRetrieveData>>>;
          }) => {
            if (!targetKey?._id || !currentKey?._id) return false;

            return (
              targetKey?._id === currentKey?._id &&
              currentKey?.path?.user_id === targetKey?.path?.user_id
            );
          },
        });
      },
    });

    const handleDeny = async () => {
      setIsPending(true);

      try {
        await changeStatus({
          path: {
            user_id: currentUser!.id,
            id: id!,
          },
          body: {
            status: ExchangeStatus.DENIED,
            [currentUser?.id === partner!.id ? 'message_partner' : 'message_creator']:
              messageRef.current || undefined,
          },
        });
        onStatusChange?.(ExchangeStatus.DENIED);
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }

      setIsPending(false);
    };

    const handleAccept = async () => {
      setIsPending(true);

      try {
        await changeStatus({
          path: {
            user_id: currentUser!.id,
            id: id!,
          },
          body: {
            status: ExchangeStatus.ACCEPTED,
            message_partner: messageRef.current || undefined,
          },
        });
        onStatusChange?.(ExchangeStatus.ACCEPTED);
      } catch (e) {
        logger.error(e);
        await resolveErrorAsync(e);
      }

      setIsPending(false);
    };

    const denyWithConfirmation = useConfirmedAsyncAction(handleDeny, {
      className: 'cs-modal-exchange-deny',
      title: t.raw('deny-confirmation.title'),
      description: t.raw('deny-confirmation.description'),
      confirmText: t.raw('deny-confirmation.confirm'),
      closeText: t.raw('deny-confirmation.cancel'),
      closeVariant: 'secondary',
      confirmVariant: 'destructive',
      body: (
        <MessageInput
          onChange={(value) => {
            messageRef.current = value;
          }}
        />
      ),
    });

    const acceptWithConfirmation = useConfirmedAsyncAction(handleAccept, {
      className: 'cs-modal-exchange-accept',
      title: t.raw('accept-confirmation.title'),
      description: t.raw('accept-confirmation.description'),
      confirmText: t.raw('accept-confirmation.confirm'),
      closeText: t.raw('accept-confirmation.cancel'),
      closeVariant: 'secondary',
      body: (
        <MessageInput
          onChange={(value) => {
            messageRef.current = value;
          }}
        />
      ),
    });

    const itemsCreatorAdjusted = useMemo(
      () =>
        adjustArrayLength<
          //@ts-ignore
          ({
            type: UnifiedInventoryItemTypeSchema;
            model: UnifiedInventoryItemSchema;
          } | null)[]
        >(items_creator ? getUnifiedItemList(items_creator) : [], {
          length: EXCHANGE_MAX_CARDS,
          cutOnOverflow: false,
        }),
      [items_creator]
    );

    const itemsPartnerAdjusted = useMemo(
      () =>
        adjustArrayLength<
          //@ts-ignore
          ({
            type: UnifiedInventoryItemTypeSchema;
            model: UnifiedInventoryItemSchema;
          } | null)[]
        >(items_partner ? getUnifiedItemList(items_partner) : [], {
          length: EXCHANGE_MAX_CARDS,
          cutOnOverflow: false,
        }),
      [items_partner]
    );

    return (
      <div
        className={cn(
          'cs-exchange-item bg-card border-border flex flex-col gap-5 rounded-md border p-4',
          className
        )}
        ref={ref}
        {...rest}
      >
        <div className="flex justify-between gap-2">
          <ReText weight="semibold">{t.raw('title').replace('{id}', String(id))}</ReText>

          <ReText weight="semibold" component="span" color={ExchangeStatusColorsMap[status!]}>
            {ExchangeStatusLabelsMap[status!]}
          </ReText>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ExchangeCard
            items={itemsCreatorAdjusted}
            user={creator}
            isCurrentUser={creator?.id === currentUser?.id}
            label={t('give-label')}
          />
          <ExchangeCard
            items={itemsPartnerAdjusted}
            user={partner}
            isCurrentUser={partner?.id === currentUser?.id}
            label={t('give-label')}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <ReText>Сообщение отправителя:</ReText>
            <ReText color="muted-foreground">{exchange?.message_creator || '--'}</ReText>
          </div>
          <div className="flex flex-col gap-1">
            <ReText>Сообщение получателя:</ReText>
            <ReText color="muted-foreground">{exchange?.message_partner || '--'}</ReText>
          </div>
        </div>

        {status === ExchangeStatus.WAIT &&
        (currentUser?.id === creator!.id || currentUser?.id === partner!.id) ? (
          <div className="flex justify-between gap-2">
            <Button
              disabled={isPending}
              onClick={denyWithConfirmation}
              color="danger"
              variant="flat"
            >
              {t.raw('deny-button')}
            </Button>
            {currentUser.id === partner!.id ? (
              <Button disabled={isPending} onClick={acceptWithConfirmation}>
                {t.raw('accept-button')}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
  (prevProps, nextProps) => prevProps.exchange?.status === nextProps.exchange?.status
);

export const ExchangeSkeleton = () => {
  return (
    <div
      className={cn(
        'cs-exchange-item bg-card border-border flex flex-col gap-5 rounded-md border p-4'
      )}
    >
      <div className="flex justify-between gap-2">
        <SkeletonV2 className="bg-skeleton h-6 w-1/4" />
        <SkeletonV2 className="bg-skeleton h-5 w-1/6" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <CarouselSkeleton className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3">
            <SkeletonV2 className="bg-skeleton size-15 rounded-sm" />
            <div className="flex w-full flex-col gap-1">
              <SkeletonV2 className="bg-skeleton h-6 w-1/4" />
              <SkeletonV2 className="bg-skeleton h-5 w-1/5" />
            </div>
          </div>
          <CarouselContent className="mx-1.5 -ml-2 gap-2 md:mr-0">
            {Array.from({ length: EXCHANGE_MAX_CARDS }, (_, idx) => (
              <CarouselItem key={idx} className="basis-1/4 pl-2 [--padding:8px]">
                <HeroCardSkeletonV2 className="h-54 w-auto" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselSkeleton>

        <CarouselSkeleton className="flex w-full flex-col gap-2">
          <div className="flex items-center gap-3">
            <SkeletonV2 className="bg-skeleton size-15 rounded-sm" />
            <div className="flex w-full flex-col gap-1">
              <SkeletonV2 className="bg-skeleton h-6 w-1/4" />
              <SkeletonV2 className="bg-skeleton h-5 w-1/5" />
            </div>
          </div>
          <CarouselContent className="mx-1.5 -ml-2 gap-2 md:mr-0">
            {Array.from({ length: EXCHANGE_MAX_CARDS }, (_, idx) => (
              <CarouselItem key={idx} className="basis-1/4 pl-2 [--padding:8px]">
                <HeroCardSkeletonV2 className="h-54 w-auto" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </CarouselSkeleton>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <SkeletonV2 className="bg-skeleton h-6 w-1/2" />
          <SkeletonV2 className="bg-skeleton h-6 w-1/4" />
        </div>
        <div className="flex flex-col gap-1">
          <SkeletonV2 className="bg-skeleton h-6 w-1/2" />
          <SkeletonV2 className="bg-skeleton h-6 w-1/4" />
        </div>
      </div>
    </div>
  );
};
