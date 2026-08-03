'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import type { DeepPartial, FieldValues } from 'react-hook-form';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { usePathname, useSearchParams } from 'next/navigation';

import ExternalLink from '@re/ui-kit/icons/external-link';
import OrderingIcon from '@re/ui-kit/icons/ordering';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';
import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';
import queryString from 'query-string';

import { useSiteConfig } from '~app/providers/site-config-provider';
import { useHeroCardCatalog } from '~entities/inventory/model/queries';
import { HeroCard, HeroCardSkeleton } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModalTrigger } from '~entities/inventory/ui/hero-card-preview/hero-card-preview-modal-trigger';
import { InfoModalTrigger } from '~features/info-modal';
import { ordering2Label } from '~pages/card/model/const';
import { CharacterSchema } from '~shared/api/models/character';
import { UserSchemaFragment } from '~shared/api/models/common';
import type { Type } from '~shared/api/models/forms';
import { InfoModalType } from '~shared/api/models/info-modal';
import { HeroCardSchema } from '~shared/api/models/inventory';
import { SearchField } from '~shared/api/models/search';
import { TitleSchemaFragment } from '~shared/api/models/title';
import { SiteArticles } from '~shared/config/constants';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useScrollRestorationRouter } from '~shared/lib/next/use-router';
import { Container } from '~shared/ui/container';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '~shared/ui/drawer';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Form } from '~shared/ui/form';
import { Underline } from '~shared/ui/underline';
import { debounce } from '~shared/utils/debounce';

import { CardCatalogOptionsProvider } from '../model/context';
import { getTransformedValues } from '../model/mapper';
import { FilterSchemaBuilder } from '../model/type';

import {
  RangeFilter,
  SearchMultiSelectFilter,
  SearchSelectFilter,
  SelectDesktopFilterType,
} from './filters';

export const filters = [
  new FilterSchemaBuilder<CharacterSchema>({
    key: 'character',
    field: 'character',
    name: 'Персонаж',
    type: 'search-multi-select',
    excludable: true,
    searchField: SearchField.characters,
  }),
  // {
  //     key: 'author',
  //     field: 'multi-search-select',
  //     name: 'Автор',
  //     type: 'search-select',
  //     excludable: true,
  //     searchField: SearchField.users,
  // },
  new FilterSchemaBuilder<TitleSchemaFragment>({
    key: 'title',
    field: 'title',
    name: 'Тайтл',
    type: 'search-multi-select',
    excludable: true,
    searchField: SearchField.titles,
    transform: (item): Type => ({
      id: String(item.id),
      name: item.main_name,
    }),
  }),
  new FilterSchemaBuilder({
    key: 'author',
    field: 'author',
    name: 'Автор',
    type: 'search-multi-select',
    excludable: true,
    searchField: SearchField.users,
    transform: (item: UserSchemaFragment): Type => ({
      id: String(item.id),
      name: item.username,
    }),
  }),
  new FilterSchemaBuilder({
    key: 'rank',
    field: 'rank',
    name: 'Ранг',
    type: 'select',
    excludable: true,
  }),
  // {
  //     key: 'power',
  //     field: 'power',
  //     name: 'Сила',
  //     type: 'range',
  // },
];

const renderDesktopFilter = (filter: FilterSchemaBuilder<unknown>) => {
  switch (filter.type) {
    case 'search-select': {
      return <SearchSelectFilter filter={filter} key={filter.key} />;
    }
    case 'search-multi-select': {
      return <SearchMultiSelectFilter filter={filter} key={filter.key} />;
    }
    case 'select': {
      return <SelectDesktopFilterType filter={filter} key={filter.key} />;
    }
    case 'range': {
      return <RangeFilter filter={filter} key={filter.key} />;
    }
    default:
      return null;
  }
};

const Filters = () => (
  <Accordion type="multiple" className="flex flex-col gap-4" defaultValue={['default']}>
    <AccordionItem value="default">
      <AccordionContent className="flex flex-col gap-4" data-testid="catalog-filters-container">
        {filters.map(renderDesktopFilter)}
      </AccordionContent>
    </AccordionItem>

    <AccordionItem
      value="exclude"
      className="border-border rounded-md border data-[state=open]:pb-2"
    >
      <AccordionHeader>
        <AccordionTrigger className="mb-0 p-4">
          <ReText align="left" weight="semibold">
            Исключения
          </ReText>
          <AccordionIndicator />
        </AccordionTrigger>
      </AccordionHeader>

      <AccordionContent
        className="mt-3 flex flex-col gap-4 p-4 pt-0"
        data-testid="catalog-filters-container"
      >
        {filters
          .filter((it) => it.excludable)
          .map((it) => ({ ...it, field: `exclude_${it.key}` }))
          .map(renderDesktopFilter)}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

const DesktopFilters = () => (
  <Media greaterThanOrEqual={Display.md} className="sticky w-1/3">
    <div className="flex flex-col gap-3 px-1 pt-2">
      <ReText size="lg" weight="semibold">
        Фильтры
      </ReText>
      <Filters />
    </div>
  </Media>
);

const MobileFilters = () => {
  const [open, setOpen] = useState(false);

  return (
    <Media lessThan={Display.md}>
      <Drawer snapPoints={[1]} open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button color="secondary">Фильтры</Button>
        </DrawerTrigger>
        <DrawerContent
          hideSwipeElement={false}
          className="fixed inset-x-0 bottom-0 -mx-px flex h-full max-h-[97%] flex-col border-none"
        >
          <DrawerHeader>
            <DrawerTitle>Фильтры</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-auto p-3">
            <Filters />
            <Button
              className="mt-3 w-full flex-[1_0_auto]"
              onClick={() => {
                setOpen(false);
              }}
            >
              Применить
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </Media>
  );
};

const Ordering = ({ slot }: { slot?: ReactNode }) => {
  const { setValue, control } = useFormContext();
  const ordering = useWatch({ control, name: 'ordering' });
  const setOrdering = (value: string) => {
    setValue('ordering', value);
  };

  const isAscOrdering = !ordering?.startsWith('-');
  const toggleOrderingDirection = () => {
    setOrdering(isAscOrdering ? `-${ordering}` : ordering?.slice(1));
  };

  return (
    <div className="flex w-full gap-2 self-start">
      <span>
        <Select value={ordering} onValueChange={setOrdering}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.entries(ordering2Label).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </span>
      <Button size="lg" circle variant="secondary" onClick={toggleOrderingDirection}>
        <OrderingIcon
          className="transition-all data-[state=reverse]:rotate-180"
          data-state={isAscOrdering ? 'default' : 'reverse'}
          size={16}
        />
      </Button>

      {slot}
    </div>
  );
};

const CardCreationRules = () => {
  const articles = useSiteConfig((v) => v.articles);

  if (!articles[SiteArticles.CARD_CREATION_RULES]) return null;

  return (
    <InfoModalTrigger
      asChild
      options={{
        type: InfoModalType.ENTRY,
        entryId: articles[SiteArticles.CARD_CREATION_RULES],
      }}
    >
      <Button color="secondary" className="min-w-fit" size="lg" endIcon={<ExternalLink />}>
        Правила создания
      </Button>
    </InfoModalTrigger>
  );
};

export const CardCatalog = () => {
  'use no memo';

  const searchParams = useSearchParams();

  const router = useScrollRestorationRouter();
  const query = getTransformedValues(searchParams.toString());
  const pathname = usePathname();

  const form = useForm({
    defaultValues: {
      ...query,
      title: undefined,
      character: undefined,
      author: undefined,
    },
  });

  const { data, fetchNextPage, isLoading, hasNextPage, isFetchingNextPage } = useHeroCardCatalog({
    variables: {
      query,
    },
  });

  const FlatList: FlatListType<HeroCardSchema[]> = _FlatList;

  useEffect(() => {
    const func = debounce(<TFieldValues extends FieldValues>(values: DeepPartial<TFieldValues>) => {
      router.replace(`${pathname}?${queryString.stringify(values)}`);
    }, 100);

    return form.watch(func).unsubscribe;
  }, []);

  return (
    <Form {...form}>
      <CardCatalogOptionsProvider>
        <Container slim className="flex flex-col gap-4 px-3 py-4">
          <div className="flex w-full items-center justify-between gap-4">
            <Underline>
              <ReText size="xl" weight="semibold">
                Каталог карт
              </ReText>
            </Underline>
            <MobileFilters />
          </div>
          <div className="flex gap-6">
            <div className="flex w-full flex-col gap-4">
              <Ordering
                slot={
                  <>
                    <span className="flex-1" />
                    <CardCreationRules />
                  </>
                }
              />

              <FlatList.Root
                content={data?.pages.flatMap((it) => it.results)}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                isLoading={isLoading}
              >
                <FlatList.Container className="grid grid-cols-3 gap-4 md:grid-cols-4 xl:grid-cols-5">
                  <FlatList.Content>
                    {({ item, index }) => (
                      <HeroCardPreviewModalTrigger key={`${item.id}-${index}`} card={item}>
                        <HeroCard withBorder withHover card={item} />
                      </HeroCardPreviewModalTrigger>
                    )}
                  </FlatList.Content>
                  <FlatList.Loading count={30}>
                    {({ key }) => <HeroCardSkeleton key={key} />}
                  </FlatList.Loading>
                  <FlatList.Empty text="Пусто" emoji="🎴" />
                  <FlatList.EdgeTrigger
                    onTrigger={fetchNextPage}
                    canTrigger={!isFetchingNextPage && hasNextPage}
                  />
                </FlatList.Container>
              </FlatList.Root>
            </div>
            <DesktopFilters />
          </div>
        </Container>
      </CardCatalogOptionsProvider>
    </Form>
  );
};
