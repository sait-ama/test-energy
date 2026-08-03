'use client';

import type { ComponentProps, ReactNode } from 'react';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FieldValues } from 'react-hook-form/dist/types';
import type { DeepPartial } from 'react-hook-form/dist/types/utils';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import queryString from 'query-string';

import Search from '@re/ui-kit/icons/search';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useTitlesByQueryInfinite } from '~entities/title/model/queries';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import { ActiveFilters } from '~features/active-filters/ui/active-filters';
import { ClearFilters } from '~features/clear-filters/ui/clear-filters';
import { CreateFilterPreset } from '~features/create-filter-preset/ui/create-filter-preset';
import { FiltersPresets } from '~features/filters-presents/ui/filters-presets';
import { SelectCatalogOrdering } from '~features/select-catalog-ordering/ui/select-catalog-ordering';
import { CatalogOptionsProvider } from '~features/title-filters/model/context';
import { getTransformedValues } from '~features/title-filters/model/lib';
import { DesktopTitleFilters, MobileTitleFilters } from '~features/title-filters/ui/title-filters';
import type { CatalogTitleQuerySchema, TitleSchemaFragment } from '~shared/api/models/title';
import { Routing } from '~shared/config/routing';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';
import { haveChangesCond } from '~shared/lib/form/can-save-cond';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useScrollRestorationRouter } from '~shared/lib/next/use-router';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Form, FormControl, FormField, FormItem, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { debounce } from '~shared/utils/debounce';

export interface CatalogRootProps {
  overrides?: {
    publishers?: string[];
    creators?: string[];
  };
  onChange?: <TFieldValues extends FieldValues>(values: DeepPartial<TFieldValues>) => void;
  children: ReactNode;
}

export const CatalogRoot = (props: CatalogRootProps) => {
  'use no memo';

  const { overrides, children, onChange } = props;

  const router = useScrollRestorationRouter();
  const searchParams = useSearchParams();
  const query = getTransformedValues(searchParams.toString());
  const pathname = usePathname();
  // @ts-ignore
  const form = useForm({
    defaultValues: { ...query, ...overrides },
  });

  useEffect(() => {
    const defaultFunc = <TFieldValues extends FieldValues>(values: DeepPartial<TFieldValues>) => {
      const route = `${pathname}?${queryString.stringify(values)}`;

      router.push(route);
    };

    const func = debounce(onChange ?? defaultFunc);
    return form.watch(func).unsubscribe;
  }, [onChange]);

  return (
    <Form {...form}>
      <CatalogOptionsProvider>{children}</CatalogOptionsProvider>
    </Form>
  );
};

export const CatalogPresets = () => {
  const form = useFormContext<CatalogTitleQuerySchema>();

  const isRealFilters = Object.keys(form.formState.dirtyFields).every(
    (it) => !['ordering'].includes(it)
  );
  const haveChanges = haveChangesCond(form) && isRealFilters;

  if (!haveChanges || !isRealFilters) {
    return <FiltersPresets />;
  }

  return (
    <ActiveFilters
      action={
        <>
          <ClearFilters />
          <CreateFilterPreset />
        </>
      }
    />
  );
};

export const CatalogOrdering = SelectCatalogOrdering;

export const CatalogSearch = ({ className }: { className?: string }) => {
  const { control } = useFormContext<CatalogTitleQuerySchema>();

  return (
    <FormField
      control={control}
      name="search"
      render={({ field }) => (
        <FormItem className={className}>
          <FormControl>
            <Input
              {...field}
              startIcon={<Search className="text-muted-foreground ml-2" size={16} />}
              placeholder="Поиск по названию"
              type="text"
              data-testid="catalog-search"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

interface CatalogListProps {
  className?: string;
}

export const CatalogList = (props: CatalogListProps) => {
  'use no memo';

  const { className } = props;
  const { control } = useFormContext();
  const query = useWatch({ control });
  const contentType = useContentType();
  const [debouncedQuery] = useDebouncedValue(query, 200);
  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useTitlesByQueryInfinite({ variables: { query: debouncedQuery } });

  const FlatList: FlatListType<TitleSchemaFragment[]> = _FlatList;

  return (
    <FlatList.Root
      content={data?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetching || isFetchingNextPage}
    >
      <FlatList.Layout
        layout="grid"
        className={cn(
          'grid-cols-3 gap-y-4 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5',
          className
        )}
      >
        <FlatList.Content>
          {({ item }) => (
            <Link
              key={item.id}
              prefetch={false}
              href={Routing.Title.detail({
                params: { dir: item.dir, content: contentType, tab: 'main' },
              })}
              {...props}
            >
              <VerticalTitleCard model={item} />
            </Link>
          )}
        </FlatList.Content>
        {/*// @ts-ignore*/}
        <FlatList.Loading count={15}>
          {({ key }) => <VerticalTitleCardSkeleton key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
      </FlatList.Layout>

      <FlatList.Empty className="col-span-2" text="Пусто" emoji="🎴" />
    </FlatList.Root>
  );
};

export const CatalogMobileFilters = () => (
  <Media lessThan={Display.md}>
    <MobileTitleFilters />
  </Media>
);

export const CatalogDesktopFilters = () => (
  <Media
    greaterThanOrEqual={Display.md}
    className="sticky-container w-full md:max-w-[300px] xl:max-w-[330px]"
  >
    <DesktopTitleFilters />
  </Media>
);

interface CatalogRootContainerProps extends ComponentProps<'div'> {}

export const CatalogRootContainer = (props: CatalogRootContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={cn('sticky-container flex max-w-screen gap-6', className)} {...rest}>
      {children}
    </div>
  );
};

interface CatalogTitleListContainerProps extends ComponentProps<'div'> {}

export const CatalogTitleListContainer = (props: CatalogTitleListContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={cn('flex w-full flex-col gap-4', className)} {...rest}>
      {children}
    </div>
  );
};

interface CatalogFiltersContainerProps extends ComponentProps<'div'> {}

export const CatalogFiltersContainer = (props: CatalogFiltersContainerProps) => {
  const { children, className, ...rest } = props;

  return (
    <div className={cn('flex flex-col gap-2', className)} {...rest}>
      {children}
    </div>
  );
};
