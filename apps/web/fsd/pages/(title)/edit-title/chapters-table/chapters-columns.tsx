'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import Coin from '@re/ui-kit/icons/coin';
import ExternalLinkIcon from '@re/ui-kit/icons/external-link';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';
import type { ColumnDef } from '@tanstack/react-table';
import DayJS from 'dayjs';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import { useActiveBranchId } from '~entities/title/model/store';
import type { ChapterSchema } from '~shared/api/models/chapter';
import { Routing } from '~shared/config/routing';

type ChaptersListColumn = 'income' | 'date';

export const getChaptersListTableColumns = (extraColumns: ChaptersListColumn[] = []) => {
  const columns: ColumnDef<ChapterSchema>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex h-12 items-center justify-center gap-3">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            aria-label="Select all"
          />
          <ReText weight="bold">Все</ReText>
          {table.getSelectedRowModel().rows.length ? (
            <ReText color="muted-foreground" size="sm">
              Выбрано {table.getSelectedRowModel().rows.length}
            </ReText>
          ) : null}
        </div>
      ),
      cell: ({ row }) => {
        const { value } = useActiveBranchId();
        const contentType = useContentType();
        const params = useParams<{ dir: string }>();

        return (
          <div className="flex h-full w-full flex-col items-start justify-center gap-2 px-4 py-2">
            <div className="flex w-full items-center gap-3">
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                  row.toggleSelected(!!value);
                }}
                aria-label="Select row"
              />
              <Link
                shallow={false}
                className="hover:underline"
                href={Routing.Chapter.editChapter({
                  chapterId: row.original.id,
                  branchId: value,
                })}
              >
                <ReText weight="medium" size="sm" className="whitespace-nowrap">
                  Том {row.original.tome} Глава {row.original.chapter}
                </ReText>
              </Link>
              <Link
                shallow={false}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                href={Routing.Chapter.main({
                  params: {
                    id: row.original.id,
                    content: contentType,
                    titleDir: params.dir,
                  },
                })}
              >
                <ExternalLinkIcon className="size-4" />
              </Link>
            </div>
          </div>
        );
      },
      accessorKey: 'tome',
      enableHiding: false,
      size: 220,
    },
    {
      id: 'Команда',
      accessorKey: 'publishers',
      header: () => (
        <div className="flex h-12 items-center justify-center">
          <ReText weight="bold">Команда</ReText>
        </div>
      ),
      cell: memo(
        ({ row }) => (
          <div className="flex h-full w-full flex-col items-center justify-center py-2">
            {row.original.publishers.map((it) => (
              <div key={it.id} className="flex w-full items-center justify-center gap-2 px-2">
                <PublisherAvatar imgSrc={it.cover?.mid} size={32} />
                <ReText className="max-w-[120px] truncate" size="sm">
                  {it.name}
                </ReText>
              </div>
            ))}
          </div>
        ),
        () => true
      ),
      size: 180,
    },
    {
      id: 'Цена',
      accessorKey: 'price',
      header: () => (
        <div className="flex h-12 items-center justify-center">
          <ReText weight="bold">Цена</ReText>
        </div>
      ),
      cell: ({ row }) => {
        const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

        return (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 py-2">
            <ReText
              weight={row.original.price ? 'bold' : 'regular'}
              className="flex items-center gap-2"
              color="muted-foreground"
              size="sm"
            >
              {row.original.price ? <Coin size={16} className="text-amber-500" /> : null}
              {row.original.price ? row.original.price : 'Бесплатно'}
            </ReText>
            {row.original.pub_date ? (
              <ReText size="xs" color="muted-foreground">
                До {DayJS(row.original.pub_date).format(dateFormat)}
              </ReText>
            ) : null}
          </div>
        );
      },
      size: 150,
    },
  ];

  if (extraColumns.includes('income')) {
    columns.push({
      id: 'Доходы',
      accessorKey: 'publisher_income',
      header: () => (
        <div className="flex h-12 items-center justify-center">
          <ReText weight="bold">Доходы</ReText>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <ReText size="sm" color="muted-foreground" className="flex whitespace-nowrap">
            Покупок:&nbsp;
            <span className="text-foreground flex items-center gap-1">
              {row.original.count_buys}
              <Coin className="size-3" />
            </span>
          </ReText>
          <ReText size="sm" color="muted-foreground" className="flex whitespace-nowrap">
            Доход:&nbsp;
            <span className="text-foreground flex items-center gap-1">
              {row.original.publisher_income}
              <Coin className="size-3" />
            </span>
          </ReText>
          {row.original.site_income ? (
            <ReText size="sm" color="muted-foreground" className="flex whitespace-nowrap">
              Доход сайта:&nbsp;
              <span className="text-foreground flex items-center gap-1">
                {row.original.site_income}
                <Coin className="size-3" />
              </span>
            </ReText>
          ) : null}
        </div>
      ),
      size: 180,
    });
  }

  columns.push({
    id: 'Даты',
    accessorKey: 'upload_date',
    header: () => (
      <div className="flex h-12 items-center justify-center">
        <ReText weight="bold">Дата загрузки</ReText>
      </div>
    ),
    cell: ({ row }) => {
      const dateFormat = useSiteConfig((v) => v.localization.dateFormat);
      const timeFormat = useSiteConfig((v) => v.localization.timeFormat);

      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 py-2">
          <ReText weight="medium" size="sm" className="tracking-wide">
            {DayJS(row.original.upload_date).format(dateFormat)}
          </ReText>
          <ReText size="xs" color="muted-foreground" className="tracking-wide">
            В {DayJS(row.original.upload_date).format(timeFormat)}
          </ReText>
        </div>
      );
    },
    size: 160,
  });

  return columns;
};
