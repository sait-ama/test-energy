'use client';
import { useCallback, useState } from 'react';
import { useParams } from 'next/navigation';
import { useFormatter } from 'next-intl';

import { Button } from '@re/ui-kit/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ReText } from '@re/ui-kit/ui/text';
import type { ColumnDef } from '@tanstack/react-table';

import { usePublisherActsQuery, usePublisherQuery } from '~entities/publisher/model/queries';
import type { ActSchema } from '~shared/api/models/publisher-contract';
import { StatusEnum, STATUSES_LABELS } from '~shared/api/models/publisher-contract';
import { DataTable } from '~shared/ui/data-table';
import { TableSortButton } from '~shared/ui/table';

interface Option {
  value: number;
  label: number;
}

//const formattedMonth = (new Date(act?.create_date).getMonth() + 1).toString().padStart(2, '0');
//                     const formattedYear = new Date(act.create_date).getFullYear();

const getActsPossibleOptions = (acts: ActSchema[]): Option[] => {
  const years: number[] = [];
  const options: Option[] = [];

  for (const act of acts) {
    const year = new Date(act.create_date).getFullYear();

    if (!years.includes(year)) {
      years.push(year);
      options.push({ label: year, value: year });
    }
  }

  return options;
};
const handleDownload = (fileUrl: string) => {
  const downloadLink = document.createElement('a');
  downloadLink.href = fileUrl;
  downloadLink.setAttribute('download', 'true');
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
const columnns = [
  {
    id: 'Дата создания',
    enableGlobalFilter: true,
    accessorKey: 'create_date',
    header: ({ column }) => (
      <TableSortButton
        isSorted={column.getIsSorted()}
        toggleSorting={column.toggleSorting}
        label="Дата создания"
      />
    ),
    cell: ({ row: { original: act } }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const formatter = useFormatter();

      return <ReText>{formatter.dateTime(new Date(act.create_date))}</ReText>;
    },
  },
  {
    id: 'accepted_date',
    accessorKey: 'create_date',
    header: 'Дата принятия',
    cell: ({ row: { original: act } }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const formatter = useFormatter();
      return (
        <ReText>{!act.accept_date ? '-' : formatter.dateTime(new Date(act.accept_date))}</ReText>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row: { original: act } }) => (
      <ReText
        color={
          act.status === StatusEnum.SOME_TROUBLES
            ? 'destructive'
            : act.status === StatusEnum.GOOD
              ? 'success'
              : 'foreground'
        }
      >
        {STATUSES_LABELS[act.status]}
      </ReText>
    ),
  },
  {
    id: 'download',
    accessorKey: 'file',
    header: 'Файл',
    cell: ({ row: { original: act } }) => (
      <Button
        onClick={() => {
          handleDownload(act.file);
        }}
      >
        Скачать
      </Button>
    ),
  },
] satisfies ColumnDef<Omit<ActSchema, 'id'>>[];
const mock = [
  {
    id: 1,
    file: 'dasdsadsaas',
    status: StatusEnum.GOOD,
    create_date: '2024-08-26T14:33:01.676Z',
    accept_date: '2024-08-26T14:33:01.676Z',
  },
  {
    id: 2,
    file: 'dasdsadsaas',
    status: StatusEnum.GOOD,
    create_date: '2024-07-26T14:33:01.676Z',
    accept_date: '2024-07-26T14:33:01.676Z',
  },
  {
    id: 3,
    file: 'dasdsadsaas',
    status: StatusEnum.UNACCEPTED,
    create_date: '2024-09-26T14:33:01.676Z',
    accept_date: '2024-09-26T14:33:01.676Z',
  },
  {
    id: 4,
    file: 'dasdsadsaas',
    status: StatusEnum.SOME_TROUBLES,
    create_date: '2023-05-26T14:33:01.676Z',
    accept_date: '',
  },
] satisfies ActSchema[];
export const PublisherActs = () => {
  const { dir } = useParams<{ dir: string }>();

  const { data: { content: { contract_id: contractId } = {} } = {} } = usePublisherQuery({
    variables: { params: { dir } },
  });
  const { data: { content: rowActs = [] } = {} } = usePublisherActsQuery(
    { variables: { params: { contractId: contractId } } },
    { enabled: !!contractId }
  );
  const acts =
    rowActs.map((x) => ({
      ...x,
      date: new Date(x.create_date).getFullYear(),
    })) || [];
  const options = getActsPossibleOptions(acts);

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const filteredActs = acts.filter((x) => x.date === selectedYear);
  const onYearChange = useCallback((value: string) => {
    setSelectedYear(Number(value));
  }, []);
  return (
    <div>
      <div className="row-auto flex justify-between p-4">
        <span className="flex items-center gap-4">
          <ReText component="h3" size="xl">
            Акты
          </ReText>
          {options?.length && (
            <Select
              value={String(selectedYear)}
              onValueChange={onYearChange}
              defaultValue={String(options[0]?.value)}
            >
              <SelectTrigger defaultValue={options[0]?.value}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </span>
      </div>
      {/*@ts-ignore*/}
      <DataTable withoutHeader columns={columnns} data={filteredActs} />
    </div>
  );
};
