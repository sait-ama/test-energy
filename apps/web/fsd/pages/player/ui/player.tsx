'use client';
import { useEffect, useMemo, useState } from 'react';
import * as React from 'react';
import { useSearchParams } from 'next/navigation';

import { useRouter } from '@bprogress/next';
import { useQueryClient } from '@tanstack/react-query';

import BookmarksIcon from '@re/ui-kit/icons/bookmarks';
import Check from '@re/ui-kit/icons/check';
import EyeCrossedIcon from '@re/ui-kit/icons/eye-crossed';
import Report from '@re/ui-kit/icons/report';
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
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useChapterView } from '~entities/chapter/model/mutations';
import { useChapter, useChaptersListInfinite } from '~entities/chapter/model/queries';
import { ChapterQueryKeys } from '~entities/chapter/model/query-keys';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { HorizontalTitleCard } from '~entities/title/ui/horizontal-title-card';
import { LikeIndicator, LikeTrigger } from '~features/reader-aside/ui/aside-components';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { BookmarkButton } from '~pages/(title)/title-detail/ui/title-cover-block/bookmark-button';
import type { ChapterRetrieveResponseSchema, ChapterSchema } from '~shared/api/models/chapter';
import { Media } from '~shared/lib/media';
import { Display } from '~shared/lib/media/const';
import { Carousel, CarouselContent } from '~shared/ui/carousel';
import type { FlatListType } from '~shared/ui/flat-list-v2';
import { FlatList as _FlatList } from '~shared/ui/flat-list-v2';
import { debounce } from '~shared/utils/debounce';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';

const PlayerContent = ({ src }: { src: string }) => {
  const [totalTime, setTotalTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const { mutateAsync } = useChapterView();
  const searchParams = useSearchParams();
  const episodeId = searchParams.get('episode');
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessage = debounce((message: MessageEvent) => {
      if (message.data.key == 'kodik_player_duration_update') {
        setTotalTime(message.data.value);
      }
      if (message.data.key == 'kodik_player_time_update') {
        setCurrentTime(message.data.value);
      }
    });

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const shouldSave = currentTime > totalTime / 2;

  useEffect(() => {
    if (!shouldSave) return;

    (async () => {
      const data = {
        chapter: episodeId!,
        page: '',
      };

      await mutateAsync(data);

      queryClient.setQueryData(
        ChapterQueryKeys.detail({ params: { chapter: String(episodeId) } }),
        (prev: ChapterRetrieveResponseSchema): ChapterRetrieveResponseSchema => ({
          ...prev,
          viewed: true,
        })
      );
      queryClient.removeQueries({
        predicate: ({ queryKey }) => queryKey[0] === ChapterQueryKeys.list({})[0],
      });
    })();
  }, [shouldSave, episodeId]);

  return (
    <iframe
      src={src}
      frameBorder="0"
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="aspect-video h-auto w-full overflow-hidden rounded-md"
    />
  );
};

export const Player = () => {
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const searchParams = useSearchParams();
  const episodeId = searchParams.get('episode');
  const router = useRouter();

  const { data: chapter } = useChapter(
    { variables: { params: { chapter: episodeId! } } },
    { enabled: !!episodeId }
  );
  const [branchId, setBranchId] = useState(chapter?.branch_id);
  const {
    data: episodes,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isFetchingPreviousPage,
    fetchPreviousPage,
    hasPreviousPage,
  } = useChaptersListInfinite({
    variables: {
      query: {
        branch_id: String(branchId),
        ordering: 'index',
        user_data: 1,
      },
    },
  });
  const onChapterChange = (chapterId: number) => {
    router.push(`/series/${title!.dir}/watch?episode=${chapterId}`);
  };

  const memoizedEpisodes = useMemo(() => episodes?.pages?.flatMap((it) => it.results), [episodes]);

  const FlatList: FlatListType<ChapterSchema[]> = _FlatList;

  return (
    <div className="flex flex-col gap-2">
      <HorizontalTitleCard model={title!} />
      <div className="border-border flex flex-col gap-2 overflow-hidden rounded-md border p-2">
        <Media lessThan={Display.md}>
          <div className="flex w-full gap-2">
            <LikeTrigger chapterId={episodeId}>
              {({ onClick }) => (
                <Button onClick={onClick} color="secondary" className="flex gap-1 !px-0">
                  <LikeIndicator chapterId={episodeId} />
                </Button>
              )}
            </LikeTrigger>
            <BookmarkButton>
              {({ children, disabled }) => (
                <Button
                  disabled={disabled}
                  color="secondary"
                  className="w-full"
                  endIcon={<BookmarksIcon />}
                >
                  <ReText size="sm">{children}</ReText>
                </Button>
              )}
            </BookmarkButton>
            <Select value={String(branchId)} onValueChange={setBranchId}>
              <SelectTrigger className="bg-secondary h-9 border-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {title.branches.map((branch, index) => (
                    <SelectItem key={index} value={String(branch.id)} className="justify-between">
                      <span className="space-x-2">
                        {branch.publishers.map((it) => it.name).join(' & ') || 'Без названия'}
                        {branch.count_chapters ? ` (${branch.count_chapters})` : null}
                      </span>
                      {branch.subscribed ? <Check /> : null}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <ReportModalAsync type="chapter" target={episodeId!}>
              <Button circle color="secondary">
                <Report />
              </Button>
            </ReportModalAsync>
          </div>
        </Media>

        <div className="flex gap-2">
          <PlayerContent src={chapter?.content} />

          <Media greaterThanOrEqual={Display.md} className="flex-[30%]">
            <div className="flex min-h-full flex-col justify-between pl-2">
              <ScrollArea>
                <div className="flex flex-col gap-2">
                  {title.branches.map((branch, index) => (
                    <Button
                      key={index}
                      variant={branch.id === branchId ? 'secondary' : 'outline'}
                      className="justify-between"
                      onClick={() => setBranchId(branch.id)}
                    >
                      <span className="space-x-2">
                        {branch.publishers.map((it) => it.name).join(' & ') || 'Без названия'}
                        {branch.count_chapters ? ` (${branch.count_chapters})` : null}
                      </span>
                      {branch.subscribed ? <Check /> : null}
                    </Button>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
              <div className="flex w-full gap-2">
                <LikeTrigger chapterId={episodeId}>
                  {({ onClick }) => (
                    <Button onClick={onClick} color="secondary" className="flex gap-1 !px-0">
                      <LikeIndicator chapterId={episodeId} />
                    </Button>
                  )}
                </LikeTrigger>
                <BookmarkButton>
                  {({ children, disabled }) => (
                    <Button
                      disabled={disabled}
                      color="secondary"
                      className="w-full"
                      endIcon={<BookmarksIcon />}
                    >
                      <ReText size="sm">{children}</ReText>
                    </Button>
                  )}
                </BookmarkButton>
                <ReportModalAsync type="chapter" target={episodeId!}>
                  <Button circle color="secondary">
                    <Report />
                  </Button>
                </ReportModalAsync>
              </div>
            </div>
          </Media>
        </div>

        <FlatList.Root content={memoizedEpisodes} isFetchingNextPage={isFetchingNextPage}>
          <Carousel
            opts={{
              align: 'start',
              dragFree: true,
            }}
            className="relative w-full"
          >
            <FlatList.EdgeTrigger
              position="top"
              onTrigger={fetchPreviousPage}
              canTrigger={hasPreviousPage && !isFetchingPreviousPage}
            />
            <CarouselContent className="relative mx-1.5 flex gap-2 md:mr-0">
              <FlatList.Content>
                {({ item }) => (
                  <Button
                    key={item.id}
                    onClick={() => onChapterChange(item.id)}
                    variant={item.id === Number(episodeId) ? 'secondary' : 'outline'}
                    className={cn('shrink-0 gap-2')}
                  >
                    {item.chapter} эпизод
                    {item.viewed ? <EyeCrossedIcon size={16} /> : null}
                  </Button>
                )}
              </FlatList.Content>
            </CarouselContent>
            <FlatList.EdgeTrigger
              onTrigger={fetchNextPage}
              canTrigger={hasNextPage && !isFetchingNextPage}
            />
          </Carousel>
        </FlatList.Root>
      </div>
      <CommentsAsync
        target={{
          chapter_id: episodeId,
        }}
      />
    </div>
  );
};
