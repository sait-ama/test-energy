'use client';

import { Suspense, useMemo } from 'react';
import { SubmitHandler, useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { queryKeyPredicateResolver } from '@re/api/exports-core';
import { AddIcon } from '@re/ui-kit/icons/add';
import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@re/ui-kit/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { type z } from 'zod';

import { useTitlesByQueryInfinite } from '~entities/title/model/queries';
import { VerticalTitleCard } from '~entities/title/ui/vertical-title-card';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import {
  AdvertisementTableAddTitleSchema,
  AdvertisementTableAddTitleValidator,
} from '~features/publisher-add-ad-table-title/model/validator';
import { usePublisherVariables } from '~pages/(publisher)/helpers/use-publisher-variables';
import { client } from '~shared/api/client';
import {
  v2DashboardPromoAddCreateMutation,
  v2DashboardPromoAggregationRetrieveOptions,
  v2DashboardPromoRetrieveInfiniteOptions,
  v2DashboardPromoRetrieveOptions,
  v2PublishersRetrieve2QueryKey,
  v2TitlesRetrieve2Options,
} from '~shared/api/generated/tanstack';
import type { TitleSchemaFragment } from '~shared/api/models/title';
import { queryClient } from '~shared/api/react-query';
import { useOpen } from '~shared/hooks/use-open';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';
import { Calendar } from '~shared/ui/calendar';
import { FlatList as _FlatList, FlatListType } from '~shared/ui/flat-list-v2';
import { Form, FormControl, FormField, FormItem, FormLabel, useForm } from '~shared/ui/form';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { cn } from '~shared/utils/cn';

import { deserializeDateRange, serializeDateRange } from '../model/utils';

export const PublisherPromotionTitleSelect = ({
  onSelect,
  value,
}: {
  onSelect: (value: { id: number; dir: string }) => void;
  value: string;
}) => {
  const { publisherId } = usePublisherVariables();

  const { data, hasNextPage, isFetchingNextPage, isFetching, fetchNextPage } =
    useTitlesByQueryInfinite({ variables: { query: { publishers: [publisherId.toString()] } } });

  const FlatList: FlatListType<TitleSchemaFragment[]> = _FlatList;

  return (
    <FlatList.Root
      content={data?.pages.flatMap((it) => it.results) ?? []}
      isLoading={isFetching || isFetchingNextPage}
    >
      <FlatList.Layout
        layout="grid"
        className={cn('grid-cols-3 gap-y-4 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5')}
      >
        <FlatList.Content>
          {({ item }) => (
            <VerticalTitleCard
              model={item}
              onClick={() => onSelect({ id: item.id, dir: item.dir })}
              className={cn(
                'cursor-pointer p-1',
                item.id === Number(value) && 'outline-primary rounded-sm outline'
              )}
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={15}>
          {({ key }) => <VerticalTitleCardSkeleton key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger canTrigger={hasNextPage} onTrigger={fetchNextPage} />
      </FlatList.Layout>

      <FlatList.Empty className="col-span-2" text="Пусто" emoji="🎴" />
    </FlatList.Root>
  );
};

interface FieldControlProps<T> {
  value: T;
  onChange: (value: T) => void;
}

const TitleFieldControl = ({ value, onChange }: FieldControlProps<string>) => {
  const [open, toggle, close] = useOpen();

  const { publisherId } = usePublisherVariables();

  const form = useFormContext<AdvertisementTableAddTitleSchema>();
  const formValue = useWatch({ control: form.control });

  const { data: _titleOptions } = useTitlesByQueryInfinite({
    variables: { query: { publishers: [publisherId.toString()] } },
  });

  const titleOptions = _titleOptions?.pages.flatMap((it) => it.results) ?? [];

  const currentTitleOption = useMemo(
    () => titleOptions.find((it) => it.id == formValue.title_id)!,
    [formValue, titleOptions]
  );

  const t = useTranslations('publisher.actions.add-ad-title.do');

  return (
    <FormControl>
      <Dialog open={open} onOpenChange={toggle}>
        <DialogTrigger asChild>
          <Button size="lg" color="secondary" className="border-border justify-start border">
            {currentTitleOption
              ? currentTitleOption.main_name
              : t('form-fields.title_dir.placeholder')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <PublisherPromotionTitleSelect
            onSelect={(value) => {
              onChange(value.id.toString());
              form.setValue('title_id', String(value.id));
              form.setValue('title_dir', value.dir);
              close();
            }}
            value={value}
          />
        </DialogContent>
      </Dialog>
    </FormControl>
  );
};

const BranchFieldControl = ({ value, onChange }: FieldControlProps<string>) => {
  const t = useTranslations('publisher.actions.add-ad-title.do');

  const { publisherId } = usePublisherVariables();

  const form = useFormContext<AdvertisementTableAddTitleSchema>();
  const formValue = useWatch({ control: form.control });

  const { data: _titleOptions } = useTitlesByQueryInfinite({
    variables: { query: { publishers: [publisherId.toString()] } },
  });

  const titleOptions = _titleOptions?.pages.flatMap((it) => it.results) ?? [];

  const currentTitleOption = useMemo(
    () => titleOptions.find((it) => it.id == formValue.title_id)!,
    [formValue, titleOptions]
  );

  const { data: title } = useSuspenseQuery({
    ...v2TitlesRetrieve2Options({
      client: client,
      path: {
        title_dir: currentTitleOption?.dir,
      },
    }),
  });

  const branchOptions = useMemo(() => {
    const branches = title?.branches?.filter((it) =>
      it.publishers?.some((it) => it.id == publisherId)
    );
    if (!branches) return [];

    return branches.map((it) => ({
      name: `ID:${it.id} ${(it.publishers ?? []).map((it) => it.name).join(',')}`,
      id: it.id,
    }));
  }, [publisherId, title]);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={t('form-fields.branch_id.placeholder')} />
      </SelectTrigger>
      <SelectContent>
        {branchOptions.map((it) => (
          <SelectItem key={it.id} value={String(it.id)}>
            {it.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const PublisherAddAdTableTitleForm = () => {
  'use no memo';

  const { publisherId } = usePublisherVariables();

  const form = useForm({
    schema: AdvertisementTableAddTitleValidator,
  });
  const t = useTranslations('publisher.actions.add-ad-title.do');

  const formValue = useWatch({ control: form.control });

  const { mutateAsync: handleAddTitle } = useMutation({
    ...v2DashboardPromoAddCreateMutation({
      client: client,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: queryKeyPredicateResolver(
          v2PublishersRetrieve2QueryKey,
          v2DashboardPromoRetrieveOptions,
          v2DashboardPromoRetrieveInfiniteOptions,
          v2DashboardPromoAggregationRetrieveOptions
        ),
      });
    },
  });

  const handleSubmit: SubmitHandler<z.infer<typeof AdvertisementTableAddTitleValidator>> = async (
    data
  ) => {
    const toast = await importToastAsync();

    try {
      const dates = deserializeDateRange(data.date_range);

      await handleAddTitle({
        path: {
          publisher_id: publisherId,
        },
        body: {
          title: Number(data.title_id),
          branch: Number(data.branch_id),
          date_start: dayjs(dates.from!).format('DD.MM.YYYY'),
          date_end: dayjs(dates.to!).format('DD.MM.YYYY'),
        },
      });
      toast.success(t('submit'));
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col">
        <FormField
          control={form.control}
          name="title_id"
          render={({ field }) => (
            <FormItem className="mt-4 flex flex-col">
              <FormLabel>{t('form-fields.title_dir.label')}</FormLabel>
              <FormControl>
                <Suspense
                  fallback={<div className="bg-secondary h-10 w-full animate-pulse rounded-md" />}
                >
                  <TitleFieldControl value={field.value} onChange={field.onChange} />
                </Suspense>
              </FormControl>
            </FormItem>
          )}
        />
        {formValue.title_id ? (
          <FormField
            control={form.control}
            name="branch_id"
            key={`branch_id-${formValue.title_id}`}
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>{t('form-fields.branch_id.label')}</FormLabel>
                <FormControl>
                  <Suspense
                    fallback={<div className="bg-secondary h-10 w-full animate-pulse rounded-md" />}
                  >
                    <BranchFieldControl value={field.value} onChange={field.onChange} />
                  </Suspense>
                </FormControl>
              </FormItem>
            )}
          />
        ) : null}

        <FormField
          control={form.control}
          name="date_range"
          render={({ field }) => {
            const { from, to } = deserializeDateRange(field.value);
            const label = [from, to]
              .map((it) => (it && dayjs(it).isValid() ? dayjs(it).format('DD.MM.YYYY') : ''))
              .join(' - ');

            return (
              <FormItem className="mt-4 flex flex-col">
                <FormLabel>{t('form-fields.dates.label')}</FormLabel>
                <FormControl>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" color="secondary" className="border-border border">
                        {label.length > 3 ? label : t('form-fields.dates.placeholder')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex flex-col items-center gap-4 sm:max-w-90">
                      <DialogTitle className="sr-only">{t('form-fields.dates.label')}</DialogTitle>
                      <Calendar
                        mode="range"
                        selected={{ from, to }}
                        disabled={{ before: dayjs().add(1, 'day').toDate() }}
                        onSelect={(range) => field.onChange(serializeDateRange(range))}
                      />
                    </DialogContent>
                  </Dialog>
                </FormControl>
              </FormItem>
            );
          }}
        />

        <Button
          className="mt-4 self-end"
          type="submit"
          disabled={!formValue.title_id || !formValue.branch_id}
          onClick={form.handleSubmit(handleSubmit)}
        >
          {t('trigger')}
        </Button>
      </form>
    </Form>
  );
};

export const PublisherAddAdTableTitleButton = () => {
  'use no memo';

  const t = useTranslations('publisher.actions.add-ad-title.do');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button color="secondary" startIcon={<AddIcon />}>
          {t('title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-md">
        <DialogTitle className="sr-only">{t('description')}</DialogTitle>
        <QuerySuspenseContainer
          fallback={<div className="bg-secondary h-100 w-full animate-pulse rounded-md" />}
        >
          <PublisherAddAdTableTitleForm />
        </QuerySuspenseContainer>
      </DialogContent>
    </Dialog>
  );
};
