'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';

import { z } from 'zod';

import { Button } from '@re/ui-kit/ui/button';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType } from '~app/providers/site-config-provider';
import { useChaptersListInfinite } from '~entities/chapter/model/queries';
import { useAddTitleBundle } from '~entities/title/model/mutations';
import { useTitleEdit } from '~entities/title/model/store';
import { getChaptersListTableColumns } from '~pages/(title)/edit-title/chapters-table/chapters-columns';
import { Routing } from '~shared/config/routing';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Form, FormControl, FormField, FormItem, FormLabel, useForm } from '~shared/ui/form';
import { Input } from '~shared/ui/input';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { VirtualizedDataTable } from '~shared/ui/virtualized-data-table';

type ChaptersListColumn = 'income' | 'date';

export const AddBundleValidator = z.object({ name: z.string(), price: z.string() });

type Schema = z.infer<typeof AddBundleValidator>;

export const AddBundleTable = () => {
  const { selectedIds, setSelectedIds } = useTitleEdit();
  const params = useParams();
  const contentType = useContentType();

  const searchParams = useSearchParams();
  const activeBranchId = searchParams.get('branchId');

  const form = useForm({ schema: AddBundleValidator });

  const {
    data: chaptersData,
    isLoading: isChaptersLoading,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useChaptersListInfinite({
    variables: {
      query: {
        is_published: 1,
        branch_id: activeBranchId!,
        detail: 1,
      },
    },
  });

  const { mutateAsync } = useAddTitleBundle({ params: { branchId: activeBranchId } });

  const selectedChapters = selectedIds.join(',');

  const combinedResults = chaptersData.pages.flatMap((item) => item.results);

  const hasPublisherIncome = combinedResults.some((it) => it.publisher_income !== undefined);

  const tableOptions = (): ChaptersListColumn[] => {
    const opt: ChaptersListColumn[] = [];

    if (hasPublisherIncome) {
      opt.push('income');
    }

    return opt;
  };

  const onSubmit = async (data: Schema) => {
    const resultData = {
      name: data.name,
      chapters: selectedIds,
      price: data.price,
      // branch_id: activeBranchId,
    };
    const toast = await importToastAsync();

    try {
      await mutateAsync(resultData);
      toast.success('Бандл добавлен');
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <>
      <Button asChild>
        <Link
          shallow={false}
          prefetch={false}
          href={Routing.Title.chaptersEdit({
            params: { dir: params.dir, tab: 'bundles', content: contentType },
          })}
        >
          Вернуться назад
        </Link>
      </Button>
      <ReText className="mt-3" size="lg">
        Добавить бандл
      </ReText>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="my-3 flex items-center justify-between gap-4">
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название бандла</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите название бандла..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Цена бандла</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите цену..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button disabled={!selectedChapters} type="submit">
              Добавить бандл
            </Button>
          </div>
          {isChaptersLoading ? (
            <Skeleton className="h-[80vh] w-full rounded-md" />
          ) : (
            <VirtualizedDataTable
              isLoading={isFetching || isFetchingNextPage}
              isEmpty={!chaptersData}
              canTrigger={hasNextPage}
              onTrigger={fetchNextPage}
              columns={getChaptersListTableColumns(tableOptions())}
              setSelectedRows={setSelectedIds}
              data={combinedResults || []}
            />
          )}
        </form>
      </Form>
    </>
  );
};
