'use client';

import { memo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { ColumnDef } from '@tanstack/react-table';
import DayJS from 'dayjs';

import Coin from '@re/ui-kit/icons/coin';
import ExternalLinkIcon from '@re/ui-kit/icons/external-link';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import { ReText } from '@re/ui-kit/ui/text';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { PublisherAvatar } from '~entities/publisher/ui/publisher-avatar';
import { useActiveBranchId } from '~entities/title/model/store';
import { Routing } from '~shared/config/routing';

export const getChapterUnpublishedListColumns = () => {
  const columns: ColumnDef<TitleChaptersEditTable>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <div className="flex h-12 items-center gap-3">
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
                <PublisherAvatar imgSrc={it.avatar?.mid} size={32} />
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
        <div className="flex h-12 items-center gap-1">
          <ReText weight="bold">Цена</ReText>
        </div>
      ),
      cell: ({ row }) => {
        const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

        return (
          <div className="flex h-full flex-col justify-center gap-1">
            <ReText className="flex items-center gap-2 tracking-wide" size="sm">
              {row.original.price ? <Coin size={16} /> : null}
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
    },
  ];

  columns.push({
    id: 'Даты',
    accessorKey: 'pub_date',
    header: () => (
      <div className="flex h-12 items-center gap-1">
        <ReText noWrap weight="bold">
          Дата публикации
        </ReText>
      </div>
    ),
    cell: ({ row }) => {
      const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

      return (
        <div className="flex h-full flex-col justify-center">
          <ReText size="sm" className="flex items-center gap-1 tracking-wide">
            {row.original.delay_pub_date
              ? DayJS(row.original.delay_pub_date).format(dateFormat)
              : '---'}
          </ReText>
        </div>
      );
    },
  });

  columns.push({
    id: 'Дата загрузки',
    accessorKey: 'upload_date',
    header: () => (
      <div className="flex h-12 items-center gap-1">
        <ReText weight="bold">Дата загрузки</ReText>
      </div>
    ),
    cell: ({ row }) => {
      const dateFormat = useSiteConfig((v) => v.localization.dateFormat);
      const timeFormat = useSiteConfig((v) => v.localization.timeFormat);

      return (
        <div className="flex flex-col justify-center">
          <ReText size="sm" className="flex items-center gap-1 tracking-wide">
            {DayJS(row.original.upload_date).format(dateFormat)}
          </ReText>
          <ReText
            size="sm"
            color="muted-foreground"
            className="flex items-center gap-1 tracking-wide"
          >
            В {DayJS(row.original.upload_date).format(timeFormat)}
          </ReText>
        </div>
      );
    },
  });

  return columns;
};
