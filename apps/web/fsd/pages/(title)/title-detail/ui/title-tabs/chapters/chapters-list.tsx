'use client';

import { ComponentProps, memo, MouseEvent, ReactNode, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import EyeIcon from '@re/ui-kit/icons/eye';
import EyeCrossedIcon from '@re/ui-kit/icons/eye-crossed';
import LikeIcon from '@re/ui-kit/icons/like';
import LockIcon from '@re/ui-kit/icons/lock';
import { Badge } from '@re/ui-kit/ui/badge';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';
import dayjs from 'dayjs';

import { useContentType, useSiteConfig } from '~app/providers/site-config-provider';
import { useChaptersListInfinite } from '~entities/chapter/model/queries';
import { ChapterItem, ChapterItemSkeleton } from '~entities/chapter/ui/chapter-item';
import { ChapterActionsService } from '~features/chapters-list/model/service';
import { ChapterOrdering, ChapterSchema, PurchaseType } from '~shared/api/models/chapter';
import { Routing } from '~shared/config/routing';
import { useDebouncedValue } from '~shared/hooks/use-debounced-value';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { useLogged, useLoggedCheck } from '~shared/lib/session/use-logged';
import { TestProps } from '~shared/lib/test/utils/test-props';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';

import { useCurrentPageSuspenseTitleDetail } from '../../../model/queries';
import {
  useChapterTabOrdering,
  useChapterTabQuery,
  useCurrentTitleBranch,
} from '../../../model/store';

const TooltipProvider = dynamic(
  () => import('@re/ui-kit/ui/tooltip').then((it) => it.TooltipProvider),
  { ssr: false }
);
const Tooltip = dynamic(() => import('@re/ui-kit/ui/tooltip').then((it) => it.Tooltip), {
  ssr: false,
});
const TooltipTrigger = dynamic(
  () => import('@re/ui-kit/ui/tooltip').then((it) => it.TooltipTrigger),
  {
    ssr: false,
  }
);
const TooltipContent = dynamic(
  () => import('@re/ui-kit/ui/tooltip').then((it) => it.TooltipContent),
  {
    ssr: false,
  }
);

const lockIcon = <LockIcon size={16} className="text-muted-foreground" />;

const PaidField = memo(({ model }: { model: ChapterSchema }) => {
  const datetimeFormat = useSiteConfig((v) => v.localization.datetimeFormat);

  if (!model.is_paid) return <span className="h-4 w-4" />;
  if (model.purchase_type === PurchaseType.VOLUME) return lockIcon;

  return (
    <Suspense fallback={lockIcon}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{lockIcon}</TooltipTrigger>
          <TooltipContent side="bottom">
            {model.pub_date
              ? `Откроется ${dayjs(model.pub_date).format(datetimeFormat)}`
              : 'Бессрочно'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Suspense>
  );
});

const ChapterViewButton = memo(
  ({ model, onView }: { model: ChapterSchema; onView?: () => void }) => {
    const isLogged = useLogged();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      onView?.();
    };

    return isLogged ? (
      <Button
        size="sm"
        variant="ghost"
        className="!px-1"
        circle
        onClickCapture={handleClick}
        {...TestProps.id(`update_view_${model.id}`)}
      >
        {model.viewed ? <EyeCrossedIcon size={16} /> : <EyeIcon size={16} />}
      </Button>
    ) : null;
  }
);

const ChapterListItemActions = memo(
  ({ model, onLike }: { model: ChapterSchema; onLike?: () => void }) => {
    const checkLogged = useLoggedCheck();

    const handleLike = checkLogged(async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();

      onLike?.();
    });

    return (
      <div className="ml-2 flex items-center justify-between gap-2">
        <PaidField model={model} />

        <Button
          {...TestProps.id(`like_btn_${model.id}`)}
          onClickCapture={handleLike}
          className="w-[80px]"
          variant="ghost"
          type="button"
          startIcon={<LikeIcon className={cn(model.rated && 'fill-current text-red-700')} />}
        >
          {model.score}
        </Button>
      </div>
    );
  }
);

interface ChapterListItemProps extends ComponentProps<'a'> {
  dir: string;
  model: ChapterSchema;
  onLike?: () => void;
  onView?: () => void;
  onClick?: (e: MouseEvent) => void;
  replace?: boolean;
  slot?: ReactNode;
}

const ChapterListItem = memo(
  ({ dir, model, onView, onLike, onClick, className, slot, ...rest }: ChapterListItemProps) => {
    const contentType = useContentType();

    return (
      <Link
        prefetch={false}
        href={Routing.Chapter.main({
          params: {
            titleDir: dir,
            id: model.id,
            content: contentType,
          },
        })}
        className={cn('relative', className)}
        onClick={onClick}
        {...rest}
        {...TestProps.id(`chapter_${model.id}`)}
      >
        <ChapterItem
          className={cn(model.viewed && 'opacity-40')}
          left={<ChapterViewButton model={model} onView={onView} />}
          right={<ChapterListItemActions model={model} onLike={onLike} />}
          model={model}
        />
        {slot}
      </Link>
    );
  }
);

export interface ChaptersListProps {
  onItemClick?: () => void;
  replaceOnChapterNav?: boolean;
  initialPage?: number;
  activeChapterId?: number;
}

export const ChaptersList = (props: ChaptersListProps) => {
  const { onItemClick, initialChapterIndex, activeChapterId } = props;
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  const [ordering] = useChapterTabOrdering();
  const [activeBranch] = useCurrentTitleBranch();
  const [chapterQuery] = useChapterTabQuery();
  const [debouncedChapterQuery] = useDebouncedValue(chapterQuery, 200);

  const countChapters = title?.count_chapters;

  const index =
    ordering === ChapterOrdering.DESC ? countChapters - initialChapterIndex : initialChapterIndex;
  const initialPage = initialChapterIndex ? Math.ceil(index / 30) : 1;

  const {
    data,
    fetchNextPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
  } = useChaptersListInfinite({
    variables: {
      query: {
        ...(debouncedChapterQuery
          ? {
              chapter: debouncedChapterQuery,
            }
          : {
              page: initialPage,
            }),
        branch_id: activeBranch,
        user_data: 1,
        ordering,
      },
    },
  });

  const handleView = useMemo(
    () => ChapterActionsService.createSetView({ onActualError: (e) => resolveErrorAsync(e) }),
    []
  );
  const handleLike = useMemo(
    () => ChapterActionsService.createSetLike({ onActualError: (e) => resolveErrorAsync(e) }),
    []
  );

  const chapters = useMemo(() => data?.pages?.flatMap((it) => it.results), [data]);

  const FlatList: FlatListType<ChapterSchema[]> = _FlatList;

  return (
    <FlatList.Root content={chapters} isLoading={isLoading} isFetchingNextPage={isFetchingNextPage}>
      <FlatList.Container className="flex flex-col gap-2" {...TestProps.id('title-chapter-list')}>
        {/*{*/}
        {/*    !data?.pageParams?.find((it) => it < initialPage) &&*/}
        {/*!isFetchingPreviousPage &&*/}
        {/*hasPreviousPage ? (*/}
        {/*  <Button*/}
        {/*    onClick={() => fetchPreviousPage()}*/}
        {/*    disabled={isFetchingPreviousPage}*/}
        {/*    variant="secondary"*/}
        {/*    className="self-center"*/}
        {/*    size="lg"*/}
        {/*  >*/}
        {/*    Загрузить предыдущее*/}
        {/*  </Button>*/}
        {/*) : (*/}
        {/*  <FlatList.EdgeTrigger*/}
        {/*    position="top"*/}
        {/*    onTrigger={fetchPreviousPage}*/}
        {/*    canTrigger={!isFetchingPreviousPage && hasPreviousPage}*/}
        {/*  />*/}
        {/*)}*/}
        {!isFetchingPreviousPage && hasPreviousPage ? (
          <Button
            onClick={() => fetchPreviousPage()}
            disabled={isFetchingPreviousPage}
            variant="secondary"
            className="self-center"
            size="lg"
          >
            Загрузить предыдущее
          </Button>
        ) : null}
        <FlatList.Loading count={8} type="prev">
          {({ key }) => <ChapterItemSkeleton key={key} />}
        </FlatList.Loading>
        <FlatList.Content>
          {({ item }) => (
            <ChapterListItem
              model={item}
              dir={title!.dir}
              key={item.id}
              onClick={onItemClick}
              className={cn({ 'border-primary rounded-md border': activeChapterId === item.id })}
              onView={() => handleView({ chapter_id: item.id, status: !item.viewed })}
              onLike={() => handleLike({ chapter: item.id })}
              slot={
                activeChapterId === item.id ? (
                  <Badge className="absolute -top-2 right-0">Вы остановились здесь</Badge>
                ) : null
              }
            />
          )}
        </FlatList.Content>
        <FlatList.Loading count={8}>
          {({ key }) => <ChapterItemSkeleton key={key} />}
        </FlatList.Loading>
        <FlatList.Empty text="Пусто" emoji="🎴" />
        <FlatList.EdgeTrigger
          onTrigger={fetchNextPage}
          canTrigger={!isFetchingNextPage && hasNextPage}
        />
      </FlatList.Container>
    </FlatList.Root>
  );
};
