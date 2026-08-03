'use client';

import ChevronDown from '@re/ui-kit/icons/chevron-down';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionIndicator,
  AccordionItem,
  AccordionTrigger,
} from '@re/ui-kit/ui/accordion';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { Skeleton } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';

import {
  RequestItemContainer,
  RequestItemContent,
  RequestItemTrigger,
} from '~entities/request/ui/request-item';
import { useUserRequestList } from '~entities/user/model/queries';
import type { ChangeRequestSchema } from '~shared/api/models/panel';
import { ChangeRequestStatus, ChangeRequestType, requestNameMap } from '~shared/api/models/panel';
import { useQueryPrimitiveParams } from '~shared/hooks/use-query-params';
import { Container } from '~shared/ui/container';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { Underline } from '~shared/ui/underline';

import { renderRequestItem } from './request-item';

const implementedPreview = (type: ChangeRequestType) => {
  switch (type) {
    case ChangeRequestType.CARD_ITEM_ADD:
      return true;
    default:
      return false;
  }
};

export const UserRequestList = () => {
  const { value: status, setValue: setStatus } = useQueryPrimitiveParams<
    ChangeRequestStatus | 'all'
  >({
    fieldName: 'status',
    defaultValue: 'all',
  });

  const { value: type, setValue: setType } = useQueryPrimitiveParams<ChangeRequestType | 'all'>({
    fieldName: 'type',
    defaultValue: 'all',
  });

  const { data, fetchNextPage, isLoading, isFetching, isFetchingNextPage, hasNextPage } =
    useUserRequestList({
      variables: {
        query: {
          status: status !== 'all' ? status : undefined,
          type: type !== 'all' ? type : undefined,
        },
      },
    });

  const items = data?.pages.flatMap((it) => it.results) ?? [];

  const FlatList: FlatListType<ChangeRequestSchema[]> = _FlatList;

  return (
    <Container layout="extraslim" className="space-y-4 rounded-md p-2 pt-4 md:mt-5 md:border">
      <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
        <Underline>
          <ReText size="xl" className="ml-2" component="h2" weight="semibold">
            Заявки
          </ReText>
        </Underline>

        <div className="flex flex-[1] flex-col items-center justify-end gap-2 self-stretch sm:flex-row">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="flex-[1_0_auto] sm:flex-[0_0_48%] md:flex-[0_0_200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value={ChangeRequestStatus.OPEN}>На модерации</SelectItem>
                <SelectItem value={ChangeRequestStatus.ACCEPTED}>Принято</SelectItem>
                <SelectItem value={ChangeRequestStatus.REJECTED}>Отклонено</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="flex-[1_0_auto] sm:flex-[0_0_48%] md:flex-[0_0_300px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все типы</SelectItem>
                {Object.values(ChangeRequestType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {requestNameMap[type]}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <FlatList.Root
        content={items}
        isLoading={isLoading}
        isFetching={isFetching}
        isFetchingNextPage={isFetchingNextPage}
        className="relative"
      >
        <Accordion type="single" collapsible className="flex flex-col gap-4">
          <FlatList.Content>
            {({ item }) => {
              const hasPreview = implementedPreview(item.type);

              return hasPreview ? (
                <AccordionItem value={String(item.id)} key={item.id}>
                  <RequestItemContainer model={item} withHover={hasPreview}>
                    <AccordionHeader className="w-full">
                      <AccordionTrigger asChild>
                        <RequestItemTrigger action={<AccordionIndicator />} />
                      </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent>
                      <RequestItemContent renderContent={renderRequestItem} />
                    </AccordionContent>
                  </RequestItemContainer>
                </AccordionItem>
              ) : (
                <RequestItemContainer key={item.id} model={item} withHover={hasPreview}>
                  <RequestItemTrigger action={<ChevronDown className="ml-4 size-4 opacity-50" />} />
                </RequestItemContainer>
              );
            }}
          </FlatList.Content>
        </Accordion>

        <FlatList.Empty text="Пусто" emoji="🎴" />
        <FlatList.Loading count={20}>
          {({ key }) => <Skeleton className="h-15 w-full rounded-md" key={key} />}
        </FlatList.Loading>
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Root>
    </Container>
  );
};
