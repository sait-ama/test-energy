'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { ColumnDef } from '@tanstack/react-table';
import DayJS from 'dayjs';

import { ReText } from '@re/ui-kit/ui/text';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { Strike } from '~shared/api/models/publisher';

export const useStrikesColumns = () => {
  const t = useTranslations(
    'publisher.segments.profile-layout.strikes.sections.strikes-table.keys'
  );
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  return useMemo(
    () =>
      [
        {
          id: 'number',
          accessorKey: 'id',
          header: t('number.title'),
        },
        {
          id: 'reason',
          accessorKey: 'reason',
          header: t('reason.title'),
          cell: ({ row }) => <ReText>{row.original.reason}</ReText>,
        },
        {
          id: 'restrictions',
          accessorKey: 'restrictions',
          header: t('restrictions.title'),
          cell: ({ row }) =>
            row.original.restrictions.map((it) => (
              <ReText key={it}> {t(`restrictions.options.${it}`)} </ReText>
            )),
        },
        {
          id: 'date',
          accessorKey: 'date',
          header: t('date.title'),
          cell: ({ row }) => {
            return <ReText>{DayJS(row.original.date).format(dateFormat)}</ReText>;
          },
        },
        {
          id: 'date_end',
          accessorKey: 'date_end',
          header: t('end-date.title'),
          cell: ({ row }) => {
            return <ReText>{DayJS(row.original.date_end).format(dateFormat)}</ReText>;
          },
        },
      ] satisfies ColumnDef<Strike>[],
    [dateFormat, t]
  );
};
