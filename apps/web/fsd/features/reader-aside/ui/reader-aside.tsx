import { useParams } from 'next/navigation';

import AddPicture from '@re/ui-kit/icons/add-picture';
import Bookmarks from '@re/ui-kit/icons/bookmarks';
import Comments from '@re/ui-kit/icons/comments';
// import CreateCard from '@re/ui-kit/icons/create-card';
import DotsVertical from '@re/ui-kit/icons/dots-vertical';
import List from '@re/ui-kit/icons/list';
import Report from '@re/ui-kit/icons/report';
import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { cn } from '@re/ui-kit/utils/cn';

import { CHAPTER_ASIDE } from '~entities/chapter/model/store';
import { useActiveChapter } from '~entities/reader/model/hooks';
import {
  getTransitionStyle,
  useHeaderVisibility,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { AsideTrigger } from '~entities/reader/ui/aside';
import { ReportModalAsync } from '~entities/report/ui/report.async';
import { useTitleDetail } from '~entities/title/model/queries';
import { CreateMomentInReaderTrigger } from '~features/create-moment-in-reader-trigger/ui/create-moment-in-reader-trigger';
import {
  AutoScroll,
  CommentsCountIndicator,
  DesktopEditNoteIndicator,
  LikeIndicator,
  LikeTrigger,
  MobileEditNoteIndicator,
  PageIndicator,
  PageIndicatorContent,
  PageIndicatorTrigger,
} from '~features/reader-aside/ui/aside-components';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { BookmarkButton } from '~pages/(title)/title-detail/ui/title-cover-block/bookmark-button';
import { ContentTypes } from '~shared/config/constants';
import { ContentTypeExclusive } from '~shared/lib/domain/content-exclusive';
import { getAbbreviatedNumber } from '~shared/utils/get-abbreviated-number';
import { CreateNoteInReaderAsync } from '~widgets/create-note-in-reader/ui/create-note-in-reader.async';
import { HeaderContainer } from '~widgets/navigation/ui/header-container';
import { AsideContainer } from '~widgets/reader-navigation-content/ui/reader-navigation-content';

export const ReaderAsideDesktop = () => {
  const activeChapterId = useReader((v) => v.activeChapterId);
  const { data } = useCurrentPageSuspenseTitleDetail();
  const can_post_comments = data?.can_post_comments ?? false;

  return (
    <AsideContainer className="z-[1000] mt-[56px] flex h-[calc(100vh-56px)] overflow-x-hidden overflow-y-auto">
      <div className="my-auto flex flex-col items-center justify-center gap-2 py-2">
        <ContentTypeExclusive only={ContentTypes.MANGA}>
          <PageIndicator>
            <PageIndicatorTrigger
              variant="ghost"
              className="[text-shadow:_0_0_5px_rgb(0_0_0)]"
              size="sm"
            />
            <PageIndicatorContent />
          </PageIndicator>
        </ContentTypeExclusive>

        <div className="bg-secondary flex flex-col gap-0.5 rounded-full py-1">
          <AsideTrigger value={CHAPTER_ASIDE.CHAPTERS}>
            <Button circle size="xl" variant="ghost">
              <List />
            </Button>
          </AsideTrigger>
          <AsideTrigger value={CHAPTER_ASIDE.COMMENTS}>
            <Button circle variant="secondary" disabled={!can_post_comments}>
              <CommentsCountIndicator asBadge>
                <Comments />
              </CommentsCountIndicator>
            </Button>
          </AsideTrigger>
          <LikeTrigger chapterId={activeChapterId}>
            {({ onClick }) => (
              <Button size="xl" onClick={onClick} variant="ghost" className="flex gap-1 !px-0">
                <LikeIndicator chapterId={activeChapterId} />
              </Button>
            )}
          </LikeTrigger>
        </div>
        <div className="bg-secondary flex flex-col gap-0.5 rounded-full py-1">
          <CreateMomentInReaderTrigger>
            <Button circle size="xl" variant="ghost">
              <AddPicture />
            </Button>
          </CreateMomentInReaderTrigger>

          {/* <Button circle size="xl" variant="ghost" disabled>
            <BadgeRoot className="flex justify-center">
              <BadgeValue className="top-[-55%] -right-3/4">soon</BadgeValue>
              <CreateCard />
            </BadgeRoot>
          </Button> */}

          <DesktopEditNoteIndicator />

          <AsideTrigger value={CHAPTER_ASIDE.SETTINGS}>
            <Button circle size="xl" variant="ghost">
              <Settings />
            </Button>
          </AsideTrigger>
        </div>
        <AutoScroll />

        <ReportModalAsync type="chapter" target={activeChapterId}>
          <Button circle variant="flat">
            <Report />
          </Button>
        </ReportModalAsync>
      </div>
    </AsideContainer>
  );
};

export const ReaderAsideMobile = () => {
  const activeChapterId = useReader((v) => v.activeChapterId);
  const params = useParams();
  const { data: chapter } = useActiveChapter();
  const { data: title } = useTitleDetail({ variables: { params: { dir: params.dir } } });
  const pageIndicator = useReaderSettings((v) => v.value.manga.pageIndicator);
  const headerVisibility = useHeaderVisibility((v) => v.visible);
  const can_post_comments = title?.can_post_comments ?? false;

  return (
    <AsideContainer
      style={getTransitionStyle(headerVisibility, true)}
      className={cn(
        'fixed top-[none] bottom-0 left-[none] z-[-1] flex h-auto w-screen flex-col items-center justify-end gap-2 pb-[env(safe-area-inset-bottom)]'
      )}
    >
      <CreateNoteInReaderAsync />

      <ContentTypeExclusive only={ContentTypes.MANGA}>
        {pageIndicator ? (
          <PageIndicator>
            <PageIndicatorTrigger
              color="secondary"
              circle
              size="sm"
              className={cn(
                'bg-background/70 flex flex-nowrap items-center gap-2 rounded-md px-3 py-2 leading-none' // 'backdrop-blur-xs' +
              )}
            />
            <PageIndicatorContent />
          </PageIndicator>
        ) : null}
      </ContentTypeExclusive>

      <HeaderContainer
        transparent
        containerClassName="!items-start"
        className="flex-nowrap justify-center gap-1"
      >
        <AutoScroll size="lg" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="lg" color="secondary" circle>
              <DotsVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <CreateMomentInReaderTrigger>
              <DropdownMenuItem disabled>Создать карточку (скоро)</DropdownMenuItem>
            </CreateMomentInReaderTrigger> */}
            <CreateMomentInReaderTrigger>
              <DropdownMenuItem>Создать момент</DropdownMenuItem>
            </CreateMomentInReaderTrigger>
            <MobileEditNoteIndicator />

            <AsideTrigger value={CHAPTER_ASIDE.SETTINGS}>
              <DropdownMenuItem>Настройки</DropdownMenuItem>
            </AsideTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="bg-secondary flex gap-2 rounded-md px-4">
          <AsideTrigger value={CHAPTER_ASIDE.CHAPTERS}>
            <Button color="secondary" size="lg" className="flex gap-1 !px-0">
              <List /> {title?.count_chapters}
            </Button>
          </AsideTrigger>
          <AsideTrigger value={CHAPTER_ASIDE.COMMENTS}>
            <Button
              size="lg"
              color="secondary"
              className="flex gap-1 !px-0"
              disabled={!can_post_comments}
            >
              <Comments /> <CommentsCountIndicator />
            </Button>
          </AsideTrigger>
          <LikeTrigger chapterId={activeChapterId}>
            {({ onClick }) => (
              <Button size="lg" onClick={onClick} color="secondary" className="flex gap-1 !px-0">
                <LikeIndicator chapterId={activeChapterId} />
                {getAbbreviatedNumber(chapter?.score ?? 0)}
              </Button>
            )}
          </LikeTrigger>
        </div>
        <BookmarkButton>
          {({ bookmarkType, disabled }) => (
            <Button
              color="secondary"
              circle
              size="lg"
              disabled={disabled}
              className={cn('relative max-w-24 text-ellipsis', {
                'after:bg-primary z-[1000] after:absolute after:top-[2px] after:right-[2px] after:h-2 after:w-2 after:rounded-full':
                  bookmarkType,
              })}
            >
              <Bookmarks />
            </Button>
          )}
        </BookmarkButton>
      </HeaderContainer>
    </AsideContainer>
  );
};
