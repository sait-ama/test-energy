'use client';

import { ComponentProps, memo, useEffect, useState } from 'react';
import Sticky from 'react-sticky-el';
import Link from 'next/link';

import { useRouter } from '@bprogress/next';
import ArrowRightIcon from '@re/ui-kit/icons/arrow-right';
import DollarCrossedIcon from '@re/ui-kit/icons/dollar-crossed';
import QuestionMark from '@re/ui-kit/icons/question-mark';
import RingingPhone from '@re/ui-kit/icons/ringing-phone';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { ScrollArea, ScrollBar } from '@re/ui-kit/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@re/ui-kit/ui/select';
import { ShadowScrollArea } from '@re/ui-kit/ui/shadow-scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@re/ui-kit/ui/tabs';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { AnimatePresence, motion } from 'motion/react';

import { useContentType } from '~app/providers/site-config-provider';
import { BookmarkOrdering as BookmarkOrderingComponent } from '~entities/bookmarks/ui/bookmark-ordering';
import {
  TitleCardContent,
  TitleCardRating,
  TitleCardRoot,
  TitleCardSubtitle,
  TitleCardTitle,
  TitleImage,
} from '~entities/title/ui/title-card-base/title-card-base';
import { VerticalTitleCardSkeleton } from '~entities/title/ui/vertical-title-card-skeleton';
import {
  useBookmarksChangeNotify,
  useBookmarksChangePushNotify,
  useMoveBookmarks,
} from '~entities/user/model/mutations';
import { useUserBookmarks, useUserBookmarksTypes } from '~entities/user/model/queries';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import type {
  ChangePushNotifyBookmarksUserRequestSchema,
  UserBookmark,
} from '~shared/api/models/user';
import { UserBookmarkViewState } from '~shared/api/models/user';
import { Routing } from '~shared/config/routing';
import { useAgeSubmitted } from '~shared/lib/age-submit/use-age-submitted';
// import { useSwipeableTabs } from '~shared/hooks/use-swipeable-tabs';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { SelectionProvider, useSelection } from '~shared/lib/selection';
import { ALL_ALIAS } from '~shared/lib/selection/_internal/const';
import {
  SelectionHandlersFeatures,
  useSelecitonHandlers,
} from '~shared/lib/selection/lib/use-selection-handlers';
import { useSession } from '~shared/lib/session/use-session';
import { Container } from '~shared/ui/container';
import { FlatList } from '~shared/ui/flat-list-v2';
import { Underline } from '~shared/ui/underline';
import { deduplicate } from '~shared/utils/record-deduplicator';

import {
  BookmarkActionTabProvider,
  BookmarksProvider,
  useBookmarkActionTab,
  useBookmarkId,
  useBookmarkOrdering,
  useBookmarksContext,
} from '../model/store';

import { BookmarkAdd } from './bookmark-add';
import { BookmarkEdit } from './bookmark-edit';

const BookmarkOrdering = () => {
  const [ordering, setOrdering] = useBookmarkOrdering();

  return <BookmarkOrderingComponent setOrdering={setOrdering} ordering={ordering} />;
};

const BookmarkActionsButton = () => {
  const { setIsEdit, isEdit } = useBookmarksContext();
  const [bookmarkId] = useBookmarkId();

  if (bookmarkId === 'all') return;

  return (
    <Button
      variant={isEdit ? 'default' : 'secondary'}
      onClick={() => {
        setIsEdit((prev) => !prev);
      }}
    >
      {isEdit ? 'Готово' : 'Действия'}
    </Button>
  );
};

const BookmarksEditTransfer = () => {
  const session = useSession()!;

  const selectAll = useSelection((v) => v.selectAll);
  const resetSelection = useSelection((v) => v.resetSelection);
  const getSelection = useSelection((v) => v.getSelection);
  const unselectAll = useSelection((v) => v.unselectAll);

  const [bookmarkId, setBookmarkId] = useBookmarkId();

  const { data: bookmarkTypesData } = useUserBookmarksTypes(
    { variables: { params: { userId: session.id } } },
    { enabled: !!session }
  );

  const bookmarkTypes = bookmarkTypesData?.results || [];

  const currentBookmark = bookmarkTypes.find(({ id }) => String(id) === bookmarkId)!;

  const [transferBookmarksTo, setTransferBookmarksTo] = useState<string>();

  const { mutateAsync: moveBookmarks, isPending } = useMoveBookmarks();

  const handleMoveBookmarks = async () => {
    const selection = getSelection();
    const include =
      selection.include === '__all__' ? selection.include : Array.from(selection.include);
    const exclude = selection.exclude ? Array.from(selection.exclude) : undefined;

    const data = {
      to: Number(transferBookmarksTo),
      from: Number(bookmarkId),
      include,
      exclude,
    };

    try {
      await moveBookmarks({ data, params: { userId: session.id } });
      unselectAll();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="border-border flex flex-col gap-5 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReText weight="semibold" size="md">
            Перенести закладки
          </ReText>
          <InfoModalTrigger
            asChild
            options={{
              type: InfoModalType.TEXT,
              text: 'Вы можете перенести выбранные тайтлы в другую закладку',
            }}
          >
            <Button color="secondary" circle size="xs" className="text-muted-foreground">
              <QuestionMark size={16} />
            </Button>
          </InfoModalTrigger>
        </div>
        <Button color="secondary" onClick={selectAll}>
          Выбрать все
        </Button>
      </div>
      <div className="flex w-full flex-col items-center gap-4 self-start md:w-[unset] md:flex-row">
        <Select
          onValueChange={(v) => {
            resetSelection();
            setBookmarkId(v);
          }}
          value={String(bookmarkId)}
        >
          <SelectTrigger className="h-9 w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="flex-0 grow-0">
            <SelectGroup>
              {bookmarkTypes.map(({ id, name }) => (
                <SelectItem key={id} value={String(id)}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div>
          <ArrowRightIcon className="rotate-0" />
        </div>
        <Select onValueChange={setTransferBookmarksTo} value={transferBookmarksTo}>
          <SelectTrigger className="h-9 w-full md:w-[200px]">
            <SelectValue placeholder="Куда" />
          </SelectTrigger>
          <SelectContent className="flex-0 grow-0">
            <SelectGroup>
              {bookmarkTypes
                .filter(({ id }) => String(id) !== bookmarkId)
                .map(({ id, name }) => (
                  <SelectItem key={id} value={String(id)}>
                    {name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <SelectedAmountButton
          className="w-full flex-[1_0_auto] md:w-[unset]"
          label="Перенести выбранное"
          disabled={isPending}
          overAll={currentBookmark.count}
          onClick={handleMoveBookmarks}
        />
      </div>
    </div>
  );
};

interface SelectedAmountButtonProps extends ButtonProps {
  overAll?: number;
  label: string;
}

const SelectedAmountButton = (props: SelectedAmountButtonProps) => {
  const { overAll = 0, label, disabled, ...rest } = props;

  const { selection } = useSelection();

  const selectedAmount =
    selection.include === ALL_ALIAS ? overAll - selection.exclude.size : selection.include.size;
  return (
    <Button disabled={disabled || !selectedAmount} {...rest}>
      {label}&nbsp;{selectedAmount}
    </Button>
  );
};

const BookmarksEditNotifications = () => {
  const getSelection = useSelection((v) => v.getSelection);
  const unselectAll = useSelection((v) => v.unselectAll);
  const session = useSession()!;

  const [isNotify, setIsNotify] = useState('true');

  const { mutateAsync: changeNotify, isPending } = useBookmarksChangeNotify();

  const handleChangeNotify = async () => {
    const bookmark = [...getSelection().include];
    const is_notify_paid_chapters = isNotify === 'true';

    const data = { include: bookmark, is_notify_paid_chapters };

    try {
      await changeNotify({ data, params: { userId: session.id } });
      unselectAll();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="border-border flex flex-col gap-5 overflow-hidden rounded-md border p-4">
      <div className="flex items-center gap-2">
        <ReText weight="semibold" size="md" style={{ lineHeight: '36px' }}>
          Изменить статус уведомлений
        </ReText>
        <InfoModalTrigger
          asChild
          options={{
            type: InfoModalType.TEXT,
            text: 'Вы можете отключить/включить уведомления о платных главах на выбранных тайтлах',
          }}
        >
          <Button color="secondary" circle size="xs" className="text-muted-foreground">
            <QuestionMark size={16} />
          </Button>
        </InfoModalTrigger>
      </div>
      <div className="flex gap-4 self-start">
        <Select onValueChange={setIsNotify} value={isNotify}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Сортировать" />
          </SelectTrigger>
          <SelectContent className="flex-0 grow-0">
            <SelectGroup>
              <SelectItem value="true">Уведомлять о платных главах</SelectItem>
              <SelectItem value="false">Не уведомлять о платных главах</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <SelectedAmountButton
          label="Применить"
          className="flex-[1_0_auto]"
          disabled={isPending}
          onClick={handleChangeNotify}
        />
      </div>
    </div>
  );
};

export const BookmarksEditPushNotifications = () => {
  const getSelection = useSelection((v) => v.getSelection);
  const unselectAll = useSelection((v) => v.unselectAll);
  const selectAll = useSelection((v) => v.selectAll);
  const session = useSession()!;
  const [bookmarkId] = useBookmarkId();

  const [isNotify, setIsNotify] = useState('true');

  const { mutateAsync: changeNotify, isPending } = useBookmarksChangePushNotify();

  const { data: bookmarkTypesData } = useUserBookmarksTypes(
    { variables: { params: { userId: session.id } } },
    { enabled: !!session }
  );

  const bookmarkTypes = bookmarkTypesData?.results || [];

  const currentBookmark = bookmarkTypes.find(({ id }) => String(id) === bookmarkId)!;

  const handleChangeNotify = async () => {
    const is_push_notify = isNotify === 'true';
    const selection = getSelection();
    const include =
      selection.include === '__all__'
        ? selection.include
        : (Array.from(selection.include) as number[]);
    const exclude = selection.exclude ? (Array.from(selection.exclude) as number[]) : undefined;

    const data: ChangePushNotifyBookmarksUserRequestSchema = {
      include,
      exclude,
      is_push_notify,
    };

    if (selection.include === '__all__') {
      data.from = bookmarkId;
    }

    try {
      await changeNotify({ data, params: { userId: session.id } });
      unselectAll();
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  };

  return (
    <div className="border-border flex flex-col gap-5 overflow-hidden rounded-md border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ReText weight="semibold" size="md" style={{ lineHeight: '36px' }}>
            Изменить статус пуш уведомлений
          </ReText>
          <InfoModalTrigger
            asChild
            options={{
              type: InfoModalType.TEXT,
              text: 'Вы можете отключить/включить пуш уведомления (уведомления от нашего приложения на телефоне)',
            }}
          >
            <Button color="secondary" circle size="xs" className="text-muted-foreground">
              <QuestionMark size={16} />
            </Button>
          </InfoModalTrigger>
        </div>
        <Button color="secondary" onClick={selectAll}>
          Выбрать все
        </Button>
      </div>
      <div className="flex gap-4 self-start">
        <Select onValueChange={setIsNotify} value={isNotify}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Сортировать" />
          </SelectTrigger>
          <SelectContent className="flex-0 grow-0">
            <SelectGroup>
              <SelectItem value="true">Отправлять пуши о новых главах</SelectItem>
              <SelectItem value="false">Не отправлять пуши о новых главах</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <SelectedAmountButton
          label="Применить"
          className="flex-[1_0_auto]"
          overAll={currentBookmark?.count ?? 0}
          disabled={isPending}
          onClick={handleChangeNotify}
        />
      </div>
    </div>
  );
};

const BookmarksEditActions = () => {
  const { actionTab, setActionTab } = useBookmarkActionTab();

  const resetSelection = useSelection((v) => v.resetSelection);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      transition={{ duration: 0.3 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-4 flex flex-col gap-4"
    >
      <Tabs
        value={actionTab ?? ''}
        onValueChange={(v) => {
          resetSelection();
          // @ts-ignore
          setActionTab(v);
        }}
        className="flex flex-col gap-2"
      >
        <ScrollArea>
          <TabsList className="self-start">
            <TabsTrigger value="bookmarks">Перенос закладок</TabsTrigger>
            <TabsTrigger value="paid-notifications">Уведомления о платках</TabsTrigger>
            <TabsTrigger value="push-notifications">Пуш уведомления</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Tabs>
      {actionTab === 'bookmarks' ? (
        <BookmarksEditTransfer />
      ) : actionTab === 'paid-notifications' ? (
        <BookmarksEditNotifications />
      ) : actionTab === 'push-notifications' ? (
        <BookmarksEditPushNotifications />
      ) : null}
    </motion.div>
  );
};

interface BookmarkTitlesItemProps extends ComponentProps<'div'> {
  model: UserBookmark;
  isActive?: boolean;
  disableLink?: boolean;
}

const BookmarkTitlesItem = memo(
  (props: BookmarkTitlesItemProps) => {
    const { isActive, disableLink, model: bookmark, ref, ...rest } = props;
    const contentType = useContentType();

    const { ageSubmitted } = useAgeSubmitted();

    const model = bookmark.title;

    const explicit = !ageSubmitted && (model?.is_erotic || model?.is_yaoi);

    const children = (
      <TitleCardRoot
        ref={ref}
        className={cn('p-xxs', isActive && 'border-primary border')}
        title={`${model?.type?.name} ${model?.main_name} ${model?.issue_year}`}
        data-id={model?.id}
        {...rest}
      >
        <TitleImage
          src={model.cover.mid}
          className={cn({ 'blur-sm': explicit })}
          slot={
            <>
              <div className="absolute right-1 bottom-1">
                {bookmark.is_push_notify ? (
                  <div
                    className={cn(
                      'bg-background/70 px-xxs flex size-8 items-center justify-center rounded-full'
                      //backdrop-blur-xs
                    )}
                  >
                    <RingingPhone />
                  </div>
                ) : null}
                {!bookmark.is_notify_paid_chapters ? (
                  <div
                    className={cn(
                      'bg-background/70 px-xxs flex size-8 items-center justify-center rounded-full'
                      //backdrop-blur-xs
                    )}
                  >
                    <DollarCrossedIcon />
                  </div>
                ) : null}
                <TitleCardRating>{bookmark.rated}</TitleCardRating>
              </div>
            </>
          }
        />
        <TitleCardContent>
          <div className="flex flex-nowrap items-center justify-between gap-1">
            <TitleCardSubtitle className="overflow-hidden">
              {model?.type?.name}&nbsp;
              {model.issue_year}
            </TitleCardSubtitle>

            <TitleCardSubtitle className="theme-event-not-overridable overflow-visible whitespace-nowrap">
              {bookmark.view_state ? (
                <div
                  className={cn(
                    'mr-2 inline-block h-2 w-2 rounded-full',
                    bookmark.view_state === UserBookmarkViewState.UNREAD_FREE && 'bg-primary',
                    bookmark.view_state === UserBookmarkViewState.UNREAD_DONATE && 'bg-destructive'
                  )}
                />
              ) : null}
              {`${bookmark.read_progress}/${bookmark.read_progress_total}`}
            </TitleCardSubtitle>
          </div>
          <TitleCardTitle>{model.main_name}</TitleCardTitle>
        </TitleCardContent>
      </TitleCardRoot>
    );

    if (disableLink) return children;

    return (
      <Link
        prefetch={false}
        href={Routing.Title.detail({
          params: { dir: model.dir, content: contentType, tab: 'main' },
        })}
        {...rest}
      >
        {children}
      </Link>
    );
  },
  (prevProps, nextProps) =>
    prevProps.isActive === nextProps.isActive && prevProps.disableLink === nextProps.disableLink
);

const BookmarkTitles = memo(() => {
  const session = useSession()!;

  const { isEdit } = useBookmarksContext();

  const [bookmarkId] = useBookmarkId();
  const [ordering] = useBookmarkOrdering();
  const {
    data: bookmarksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useUserBookmarks(
    {
      variables: {
        params: {
          userId: session.id,
        },
        query: {
          type: bookmarkId === 'all' ? undefined : bookmarkId,
          ordering,
        },
      },
    },
    { enabled: !!session }
  );

  // const { data: bookmarkTypesData } = useUserBookmarksTypes(
  //   { variables: { params: { userId: session.id } } },
  //   { enabled: !!session }
  // );

  const bookmarks = bookmarksData?.pages.flatMap((it) => it.results) || [];
  // const bookmarkTypes = bookmarkTypesData?.results || [];

  // const handlers = useSwipeableTabs({
  //   enabled: !isEdit,
  //   variants: bookmarkTypes.map((v) => String(v.id)),
  //   value: String(bookmarkId),
  //   onChange: ({ value }) => setBookmarkId(value),
  // });

  const { isSelected, switchSelection } = useSelection();

  const selectionAttrLabel = 'selectionitem';

  const selecitonHandlers = useSelecitonHandlers({
    dataAttr: selectionAttrLabel,
    enabled: isEdit,
    features: [SelectionHandlersFeatures.SelectMultipleDelegated],
  });

  return (
    <div className="h-full">
      <FlatList.Root
        content={bookmarks}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={isLoading}
      >
        <FlatList.Container
          className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          {...selecitonHandlers}
        >
          <FlatList.Content>
            {({ item }) => {
              const dataAttrs = {
                [`data-${selectionAttrLabel}`]: item.id,
              };

              return (
                <BookmarkTitlesItem
                  isActive={isEdit && isSelected(item.id)}
                  disableLink={isEdit}
                  onClickCapture={(e) => {
                    if (isEdit) {
                      e.preventDefault();
                      switchSelection(item.id);
                    }
                  }}
                  key={item.id}
                  model={item}
                  {...dataAttrs}
                />
              );
            }}
          </FlatList.Content>
          <FlatList.Loading count={20}>
            {({ key }) => <VerticalTitleCardSkeleton key={key} />}
          </FlatList.Loading>
          <FlatList.EdgeTrigger
            onTrigger={fetchNextPage}
            canTrigger={!isFetchingNextPage && hasNextPage}
          />
          <FlatList.Empty text="Пусто" emoji="🎴" />
        </FlatList.Container>
      </FlatList.Root>
    </div>
  );
});

const BookmarkTabs = () => {
  const session = useSession()!;

  const { setIsEdit } = useBookmarksContext();
  const [bookmarkId, setBookmarkId] = useBookmarkId();

  const { data: bookmarkTypesData } = useUserBookmarksTypes(
    { variables: { params: { userId: session.id } } },
    { enabled: !!session }
  );
  const resetSelection = useSelection((v) => v.resetSelection);

  const bookmarkTypes = bookmarkTypesData?.results || [];

  return (
    <Tabs
      value={String(bookmarkId)}
      onValueChange={(v) => {
        if (v === 'all') setIsEdit(false);
        resetSelection();
        setBookmarkId(v);
      }}
      className="w-[calc(100%-100px)]"
      // className="w-[80%]"
    >
      <ShadowScrollArea>
        <TabsList>
          <TabsTrigger value="all" className="flex gap-2 whitespace-nowrap">
            Все
          </TabsTrigger>
          {bookmarkTypes.map((item) => (
            <TabsTrigger
              key={item.id}
              value={String(item.id)}
              className="flex gap-2 whitespace-nowrap"
            >
              {item.name}
              <ReText
                size="xs"
                color={String(item.id) === bookmarkId ? 'primary-foreground' : 'muted-foreground'}
              >
                {item.count}
              </ReText>
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ShadowScrollArea>
    </Tabs>
  );
};

const Bookmarks = memo(() => {
  const { isEdit } = useBookmarksContext();
  const [bookmarkId] = useBookmarkId();

  return (
    <BookmarkActionTabProvider>
      <Container slim className="relative mt-4 flex-1 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4 px-1">
            <Underline>
              <ReText size="xl" component="h2" weight="semibold">
                Закладки
              </ReText>
            </Underline>
            <BookmarkActionsButton />
          </div>
          <AnimatePresence>
            {isEdit && bookmarkId !== 'all' ? <BookmarksEditActions /> : null}
          </AnimatePresence>
          <div className="flex flex-col">
            <Sticky wrapperClassName="bg-background" topOffset={-8} stickyClassName="z-100">
              <div className="flex justify-between gap-4 py-2">
                <BookmarkTabs />
                <div className="flex gap-2">
                  <BookmarkAdd />
                  <BookmarkEdit />
                </div>
              </div>
            </Sticky>

            <div className="mt-2 mb-2 flex gap-3 self-end">
              <BookmarkOrdering />
            </div>
          </div>
          <BookmarkTitles />
        </div>
      </Container>
    </BookmarkActionTabProvider>
  );
});

const BookmarksRoot = () => {
  const session = useSession()!;

  const [isEdit, setIsEdit] = useState(false);

  const router = useRouter();

  const [bookmarkId] = useBookmarkId();

  const [ordering] = useBookmarkOrdering();

  const { data: bookmarksData } = useUserBookmarks(
    {
      variables: {
        params: {
          userId: session.id,
        },
        query: {
          type: bookmarkId === 'all' ? undefined : bookmarkId,
          ordering,
        },
      },
    },
    { enabled: !!session }
  );

  const bookmarks = deduplicate(
    bookmarksData?.pages.flatMap((it) => it.results) || [],
    (it) => it.id
  );

  useEffect(() => {
    if (!session) {
      router.push(Routing.Home.main({}));
    }
  }, [session]);

  return (
    <SelectionProvider
      value={{ data: bookmarks, enabled: isEdit, config: { backendSelectAll: true } }}
    >
      <BookmarksProvider value={{ isEdit, setIsEdit }}>
        <Bookmarks />
      </BookmarksProvider>
    </SelectionProvider>
  );
};

export { BookmarksRoot as Bookmarks };
