import { useMemo, useState } from 'react';
import Link from 'next/link';

import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import Trash from '@re/ui-kit/icons/trash';
import { Button } from '@re/ui-kit/ui/button';
import { Checkbox } from '@re/ui-kit/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ReText } from '@re/ui-kit/ui/text';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { BookmarksList } from '~entities/bookmarks/ui/bookmarks-list';
import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import {
  useAddTitleToBookmarks,
  useRemoveTitleFromBookmarks,
} from '~entities/title/model/mutations';
import { TitleImage } from '~entities/title/ui/title-image';
import { useUserHistory } from '~entities/user/model/queries';
import { UserKeys } from '~entities/user/model/query-keys';
import { DeleteHistoryTrigger } from '~features/delete-history-item/ui/delete-history-item';
import {
  SelectBookmarkTypeTrigger,
  SelectBookmarkTypeTriggerValue,
} from '~features/select-bookmark-type/ui/select-bookmark-type';
import type { UserHistoryPaginatedListResponseSchema } from '~shared/api/models/user';
import { ContentTypes } from '~shared/config/constants';
import { Routing } from '~shared/config/routing';
import { useBeforeUnloadAlert } from '~shared/hooks/use-before-unloaded';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { useSession } from '~shared/lib/session/use-session';
import type { ConfirmationParams } from '~shared/lib/submit-action/use-submit-action';
import { FlatList, FlatListEdgeTrigger } from '~shared/ui/flat-list-v2';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { Underline } from '~shared/ui/underline';
import { NArray } from '~shared/utils/NArray';

const selectedConfirmationParams: ConfirmationParams = {
  title: 'Вы уверены, что хотите удалить выбранные прочтения?',
  description: 'Произведения пропадут с данной страницы, однако прогресс чтения останется',
  closeText: 'Отмена',
  confirmText: 'Удалить',
  closeVariant: 'secondary',
  confirmVariant: 'destructive',
};

const allConfirmationParams: ConfirmationParams = {
  title: 'Вы уверены, что хотите удалить всю историю прочтения?',
  description: 'Произведения пропадут с данной страницы, однако прогресс чтения останется',
  closeText: 'Отмена',
  confirmText: 'Удалить',
  closeVariant: 'secondary',
  confirmVariant: 'destructive',
};

interface HistoryHeaderProps {
  selectedItems: number[];
  onReset: () => void;
}

const HistoryHeader = ({ selectedItems, onReset }: HistoryHeaderProps) => {
  return (
    <div className="mb-4 flex flex-wrap justify-between gap-2">
      <Underline>
        <ReText size="lg" weight="semibold">
          История чтения
        </ReText>
      </Underline>
      <div className="flex gap-2">
        {selectedItems.length > 0 ? (
          <DeleteHistoryTrigger
            data={selectedItems}
            confirmation={selectedConfirmationParams}
            onSuccess={onReset}
          >
            <Button variant="destructive" size="sm">
              Удалить ({selectedItems.length})
            </Button>
          </DeleteHistoryTrigger>
        ) : null}
        <DeleteHistoryTrigger
          data="__all__"
          confirmation={allConfirmationParams}
          onSuccess={onReset}
        >
          <Button
            startIcon={<Trash />}
            color="secondary"
            size="sm"
            className="fixed bottom-16 z-10 md:static"
            style={{ left: 'calc((100% - 180px) / 2)' }}
          >
            Удалить всю историю
          </Button>
        </DeleteHistoryTrigger>
      </div>
    </div>
  );
};

interface HistoryDateSectionProps {
  date: string;
  items: UserHistoryPaginatedListResponseSchema['results'] | undefined;
  selectedItems: number[];
  onToggleItem: (id: number) => void;
  onToggleAll: (ids: number[], selected: boolean) => void;
  onBookmarkCreate: (titleId: number, bookmarkId: number) => Promise<void>;
  onBookmarkRemove: (titleId: number) => Promise<void>;
  contentType: ContentTypes;
  timeFormat: string;
  userId: string;
}

const HistoryDateSection = ({
  date,
  items = [],
  selectedItems,
  onToggleItem,
  onToggleAll,
  onBookmarkCreate,
  onBookmarkRemove,
  contentType,
  timeFormat,
  userId,
}: HistoryDateSectionProps) => {
  const allSelected = items.length > 0 && items.every((item) => selectedItems.includes(item.id));
  const someSelected = items.some((item) => selectedItems.includes(item.id));

  const handleToggleAll = () => {
    const itemIds = items.map((item) => item.id);
    onToggleAll(itemIds, !allSelected);
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="border-border mb-6 overflow-hidden rounded-md border">
      <div className="bg-muted/50 flex items-center justify-between px-4 py-2">
        <ReText weight="medium">{date}</ReText>
        <Checkbox
          checked={allSelected}
          data-state={!allSelected && someSelected ? 'indeterminate' : undefined}
          onCheckedChange={handleToggleAll}
        />
      </div>
      <div className="divide-border divide-y">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-2 ${selectedItems.includes(item.id) ? 'bg-accent/10' : ''}`}
          >
            <div className="flex w-[40px] justify-center pr-2">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => onToggleItem(item.id)}
              />
            </div>
            <Link
              className="flex flex-1 gap-4"
              href={Routing.Title.detail({
                params: {
                  tab: Routing.Title.TitleDetailTabs.MAIN,
                  dir: item.title.dir,
                  content: contentType,
                },
              })}
            >
              <div className="relative aspect-[3/4] min-w-[60px]">
                <TitleImage
                  alt={item.title.main_name || item.title.secondary_name}
                  src={item.title.cover[TITLE_PREVIEW_SIZE]}
                  fill
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                <ReText size="xs" color="muted-foreground">
                  {dayjs(item.date).format(timeFormat)}
                </ReText>
                <ReText size="sm" weight="semibold" lineClamp={2}>
                  {item.title.main_name}
                </ReText>
                {item.chapter ? (
                  <ReText size="sm" color="muted-foreground">
                    {item.chapter.tome} том {item.chapter.chapter} глава
                    {item.page ? ` ${item.page} страница` : null}
                  </ReText>
                ) : null}
              </div>
            </Link>
            <div className="flex w-[40px] justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" circle size="sm">
                    <DotsVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {item.bookmark_type ? (
                    <DropdownMenuItem onClick={() => onBookmarkRemove(item.title.id)}>
                      Удалить из закладок
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <Media lessThan={Display.md}>
                        <SelectBookmarkTypeTrigger
                          onSelect={(bookmarkId) => onBookmarkCreate(item.title.id, bookmarkId)}
                          selectedId={item.bookmark_type}
                        >
                          <SelectBookmarkTypeTriggerValue />
                        </SelectBookmarkTypeTrigger>
                      </Media>
                      <Media greaterThanOrEqual={Display.md}>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Добавить в закладки</DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent sideOffset={2} alignOffset={-5}>
                              <BookmarksList
                                variables={{
                                  params: {
                                    userId,
                                  },
                                }}
                                className="gap-0"
                              >
                                {({ values }) =>
                                  values.map((ub) => (
                                    <DropdownMenuItem
                                      key={ub.id}
                                      onSelect={() => onBookmarkCreate(item.title.id, ub.id)}
                                    >
                                      {ub.name}
                                    </DropdownMenuItem>
                                  ))
                                }
                              </BookmarksList>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </Media>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HistoryList = () => {
  const session = useSession()!;
  const { data, hasNextPage, fetchNextPage } = useUserHistory({
    variables: { params: { userId: session.id } },
  });
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const flattedData = data?.pages.flatMap((v) => v.results) ?? [];
  const contentType = useContentType();
  const { mutateAsync: addToBookmarks } = useAddTitleToBookmarks();
  const { mutateAsync: removeFromBookmarks } = useRemoveTitleFromBookmarks();
  const longDateFormat = useSiteConfig((v) => v.localization.longDateFormat);
  const timeFormat = useSiteConfig((v) => v.localization.timeFormat);

  const historyByDate = useMemo(() => {
    return NArray.newBy(flattedData).groupBy((v) => dayjs(v.date).format(longDateFormat));
  }, [flattedData, longDateFormat]);

  const dates = Object.keys(historyByDate);

  // Переключает выбор одного элемента
  const handleToggleItem = (id: number) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Переключает выбор группы элементов
  const handleToggleAll = (ids: number[], selected: boolean) => {
    setSelectedItems((prev) => {
      if (selected) {
        // Добавляем элементы, которых еще нет в списке
        const newItems = [...prev];
        ids.forEach((id) => {
          if (!prev.includes(id)) {
            newItems.push(id);
          }
        });
        return newItems;
      } else {
        // Удаляем элементы из списка
        return prev.filter((id) => !ids.includes(id));
      }
    });
  };

  const handleReset = () => {
    setSelectedItems([]);
  };

  const handleBookmarkCreate = async (titleId: number, bookmarkId: number) => {
    const toast = await importToastAsync();
    try {
      await addToBookmarks({
        title: titleId,
        type: bookmarkId,
      });
      queryClient.setQueryData(
        UserKeys.historyByUserId({ params: { userId: session.id } }),
        (data: any) => {
          if (!data) return data;
          return { ...data, bookmark_type: bookmarkId };
        }
      );
      toast.success('Произведение добавлено в закладки успешно');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  const handleBookmarkRemove = async (titleId: number) => {
    const toast = await importToastAsync();

    try {
      await removeFromBookmarks({
        title: String(titleId),
      });
      queryClient.setQueryData(
        UserKeys.historyByUserId({ params: { userId: session.id } }),
        (data: any) => {
          if (!data) return data;
          return { ...data, bookmark_type: null };
        }
      );
      toast.success('Закладка успешно удалена');
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  useBeforeUnloadAlert(!!selectedItems.length);

  return (
    <div className="w-full">
      <HistoryHeader selectedItems={selectedItems} onReset={handleReset} />
      <FlatList.Root content={dates}>
        <FlatList.Container className="grid w-full !grid-cols-1 gap-4 px-2 md:grid-cols-2 md:px-0">
          <FlatList.Content>
            {({ item: date }) => (
              <HistoryDateSection
                date={date}
                items={historyByDate[date]}
                selectedItems={selectedItems}
                onToggleItem={handleToggleItem}
                onToggleAll={handleToggleAll}
                onBookmarkCreate={handleBookmarkCreate}
                onBookmarkRemove={handleBookmarkRemove}
                contentType={contentType}
                timeFormat={timeFormat}
                userId={String(session.id)}
              />
            )}
          </FlatList.Content>
          <FlatListEdgeTrigger onTrigger={fetchNextPage} canTrigger={hasNextPage} />
        </FlatList.Container>
      </FlatList.Root>
    </div>
  );
};
