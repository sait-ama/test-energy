'use client';

import { ComponentPropsWithoutRef, PropsWithChildren, Suspense, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';

import { InventoryRepository } from '~entities/inventory/model/repository';
import { InventoryExchangeCreateItemsSchema } from '~shared/api/models/inventory';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Container } from '~shared/ui/container';
import { FlatList as _FlatList, type FlatListType } from '~shared/ui/flat-list-v2';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { Underline } from '~shared/ui/underline';
import { adjustArrayLength } from '~shared/utils/adjust-array-length';

import {
  SelectionStoreProvider,
  SeletionItemSchema,
  useScopedSelection,
  useSelection,
} from '../model/selection';
import {
  EXCHANGE_MAX_ITEMS,
  EXCHANGE_TYPE,
  ExchangesProvider,
  ExchangeTargetTabsSchema,
  FiltersProvider,
  useExchangeItems,
  useExchangesStore,
  useExchangeType,
} from '../model/store';

import { ExchangeCard, ExchangeCardItem } from './exchange-card';
import { ExchangeControls } from './exchange-controls';
import { ExchangeItem, ExchangeItemActions, ExchangeItemPlaceholder } from './exchange-item';
import { ExchangeMessage } from './filters';

const ExchangeList = ({ className }: { className?: string }) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useExchangeItems();
  const exchangeStore = useExchangesStore();

  const dataFlat = useMemo(() => data?.pages.flatMap((it) => it.results) || [], [data?.pages]);
  const selection = useScopedSelection(exchangeStore.target);

  const FlatList: FlatListType<typeof dataFlat> = _FlatList;

  return (
    <FlatList.Root
      content={dataFlat}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      className={className}
    >
      <FlatList.Container className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        <FlatList.Content>
          {({ item }) => {
            const itemMeta = selection.getItemMeta(item);

            return (
              <ExchangeItem
                key={itemMeta.id}
                actions={
                  <ExchangeItemActions
                    count={itemMeta.count}
                    countMax={itemMeta.countMax}
                    canAdd={itemMeta.canAdd}
                    canRemove={itemMeta.canRemove}
                    onAdd={() => selection.addItem(item)}
                    onRemove={() => selection.removeItem(item)}
                  />
                }
                type={item.type}
                model={item.model}
              />
            );
          }}
        </FlatList.Content>

        <FlatList.Loading count={20}>
          {({ key }) => <ExchangeItemPlaceholder isLoading key={key} />}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" className="col-span-full" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
};

interface ExchangeTargetTabsProps extends Omit<ComponentPropsWithoutRef<typeof Tabs>, 'value'> {}

const ExchangeTargetTabs = ({ className, ...rest }: ExchangeTargetTabsProps) => {
  const exchangeStore = useExchangesStore();
  const t = useTranslations('exchanges.create');

  return (
    <Tabs
      value={exchangeStore.target}
      onValueChange={(value) =>
        exchangeStore.setTarget(value as unknown as ExchangeTargetTabsSchema)
      }
      className={className}
      {...rest}
    >
      <ScrollArea>
        <TabsList>
          <TabsTrigger value="creator">{t('creator.tab-label')}</TabsTrigger>
          <TabsTrigger value="partner">
            <span className="max-w-60 truncate overflow-hidden md:max-w-100">
              {t('partner.tab-label', { username: exchangeStore.partner.username })}
            </span>
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" hidden />
      </ScrollArea>
    </Tabs>
  );
};

interface ExchangeTypeTabsProps extends Omit<ComponentPropsWithoutRef<typeof Tabs>, 'value'> {}

const ExchangeTypeTabs = ({ className, ...rest }: ExchangeTypeTabsProps) => {
  const t = useTranslations('exchanges.create.types');

  const { type, setType } = useExchangeType();

  return (
    <Tabs value={type} onValueChange={(value) => setType(value)} className={className} {...rest}>
      <ScrollArea>
        <TabsList>
          {EXCHANGE_TYPE.map((value) => (
            <TabsTrigger key={value} value={value}>
              {t(value)}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" hidden />
      </ScrollArea>
    </Tabs>
  );
};

const ExchangeHeader = () => {
  const t = useTranslations('exchanges.create');
  const exchangesStore = useExchangesStore();

  const creatorSelection = useScopedSelection('creator');
  const partnerSelection = useScopedSelection('partner');

  type ItemType = SeletionItemSchema | null;

  const config = [
    {
      title: t('creator.title', {
        count: creatorSelection.value.length,
        countMax: EXCHANGE_MAX_ITEMS,
      }),
      label: t('creator.label'),
      selection: creatorSelection,
      items: adjustArrayLength<ItemType, ItemType[]>(creatorSelection.value, {
        length: 3,
        cutOnOverflow: false,
      }),
      target: exchangesStore.creator,
    },
    {
      title: (
        <span>
          <span className="line-clamp-1 break-all">
            {t('partner.title')}&nbsp;{exchangesStore.partner.username}
          </span>
          &nbsp;(
          {partnerSelection.value.length}/{EXCHANGE_MAX_ITEMS})
        </span>
      ),
      label: t('partner.label'),
      selection: partnerSelection,
      items: adjustArrayLength<ItemType, ItemType[]>(partnerSelection.value, {
        length: 3,
        cutOnOverflow: false,
      }),
      target: exchangesStore.partner,
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
      {config.map(({ title, label, selection, items, target }) => (
        <ExchangeCard key={title} title={title} label={label} user={target}>
          {items.map((value, index) => {
            if (!value) {
              return (
                <ExchangeCardItem key={`empt${index}`}>
                  <ExchangeItemPlaceholder isEmpty />
                </ExchangeCardItem>
              );
            }
            const item = { type: value.type, model: value.model };
            const itemMeta = selection.getItemMeta(item);

            return (
              <ExchangeCardItem key={item.model.id}>
                <ExchangeItem
                  {...item}
                  actions={
                    <ExchangeItemActions
                      count={itemMeta.count}
                      countMax={itemMeta.countMax}
                      canAdd={itemMeta.canAdd}
                      canRemove={itemMeta.canRemove}
                      onAdd={() => selection.addItem(item)}
                      onRemove={() => selection.removeItem(item)}
                    />
                  }
                />
              </ExchangeCardItem>
            );
          })}
        </ExchangeCard>
      ))}
    </div>
  );
};

const CreateExchangeContainer = ({ children }: PropsWithChildren) => (
  <Suspense fallback={null}>
    {/* <ExchangesDisabledBoundary> */}
    <FiltersProvider>
      <ExchangesProvider>
        <SelectionStoreProvider scopes={['creator', 'partner']}>
          <Container slim className="mt-4 rounded-md">
            {children}
          </Container>
        </SelectionStoreProvider>
      </ExchangesProvider>
    </FiltersProvider>
    {/* </ExchangesDisabledBoundary> */}
  </Suspense>
);

const CreateExchangeButton = () => {
  const t = useTranslations('exchanges.create');
  const tReusable = useTranslations('reusable.actions');

  const creatorSelection = useScopedSelection('creator');
  const partnerSelection = useScopedSelection('partner');
  const { resetSelection } = useSelection();

  const exchangesStore = useExchangesStore();

  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestExchange = async () => {
    setIsLoading(true);

    const toast = await importToastAsync();

    const fieldMapper = (type: string) => (type === 'card' ? 'cards' : `customizations`);

    try {
      const items_creator: InventoryExchangeCreateItemsSchema = {};
      const items_partner: InventoryExchangeCreateItemsSchema = {};

      const mutateItems = (
        obj: InventoryExchangeCreateItemsSchema,
        selection: SeletionItemSchema[]
      ) => {
        selection.forEach(({ type, model, count }) => {
          const field = fieldMapper(type);

          const newItems = Array.from({ length: count }).map(() => model.id);

          obj[field] = obj[field] ? [...obj[field], ...newItems] : [...newItems];
        });
      };

      mutateItems(items_creator, creatorSelection.value);
      mutateItems(items_partner, partnerSelection.value);

      const payload = {
        params: {
          userId: exchangesStore.creator.id,
        },
        data: {
          creator: exchangesStore.creator.id,
          partner: exchangesStore.partner.id,
          items_creator,
          items_partner,
          message_creator: exchangesStore.message,
        },
      };

      await InventoryRepository.Exchange.create(payload);

      toast.success(t('success-message'));
      resetSelection();
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }

    setIsLoading(false);
  };

  return (
    <Button onClick={handleSuggestExchange} loading={isLoading}>
      {tReusable('submit')}
    </Button>
  );
};

export const CreateExchange = () => {
  const t = useTranslations('exchanges.create');

  return (
    <CreateExchangeContainer>
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <Underline>
            <ReText size="2xl" weight="bold">
              {t('action-title')}
            </ReText>
          </Underline>
          <CreateExchangeButton />
        </div>
        <ExchangeHeader />
        <ExchangeMessage className="mt-5" />
        <ExchangeControls
          targetControls={<ExchangeTargetTabs />}
          typeControls={<ExchangeTypeTabs />}
        />

        <ExchangeList className="mt-5" />
      </div>
    </CreateExchangeContainer>
  );
};
