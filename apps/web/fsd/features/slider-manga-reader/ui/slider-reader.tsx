'use client';

import { memo, ReactNode, useEffect, useRef } from 'react';

// import { ChapterImage } from '~entities/chapter/ui/chapter-image-v2';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import {
  useClickableAreaHandlers,
  useGlobalPages,
  useHeaderVisibility,
  useItemsInView,
  usePreloadCurrentChapterImages,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { ChapterImage } from '~entities/reader/ui/chapter-image';
import { PageContainer } from '~entities/reader/ui/page-container';
import { Advertising } from '~features/reader-ad/ui/reader-ad';
import { noop } from '~shared/utils/noop';

const ChapterImageMemoized = memo(
  ChapterImage,
  (prevProps, nextProps) =>
    prevProps.model.id === nextProps.model.id && prevProps.model.link === nextProps.model.link
);

ChapterImageMemoized.displayName = 'ChapterImageMemoized';

export const SliderReader = ({ children }: { children: ReactNode }) => {
  const { data } = useCurrentChapter();
  const { utils } = useItemsInView();
  const setActivePageIndex = useReader((v) => v.setActivePageIndex);
  const activePageIndex = useReader((v) => v.activePageIndex);
  const initialPageIndex = useReader((v) => v.initialPageIndex);
  const setActivePageIndexHardFunc = useReader((v) => v.setActivePageIndexHardFunc);
  const gapBetweenItems = useReaderSettings((v) => v.value.manga.gapBetweenItems);
  const handleMenu = useHeaderVisibility((v) => v.toggle);
  const registerActions = useClickableAreaHandlers((v) => v.registerActions);
  const activeChapterId = useReader((v) => v.activeChapterId);
  const pagesRef = useGlobalPages();

  const initScrollState = useRef<'init' | 'pending' | 'ready'>('init');

  useEffect(() => {
    utils.add(activePageIndex);
  }, []);

  useEffect(() => {
    if (!initialPageIndex) {
      initScrollState.current = 'ready';
      return;
    }

    if (initScrollState.current !== 'init') return;

    initScrollState.current = 'pending';
    // may lag in safari without requestAnimationFrame
    requestAnimationFrame(() => {
      // lagging without smooth
      pagesRef.current?.[data!.id]?.[initialPageIndex]?.scrollIntoView({ behavior: 'smooth' });

      initScrollState.current = 'ready';
    });
  }, []);

  useEffect(() => {
    registerActions({
      onMenu: handleMenu,
      onNext: noop,
      onPrev: noop,
    });
  }, []);

  useEffect(() => {
    setActivePageIndexHardFunc(() => (index: number) => {
      setActivePageIndex(index);
      pagesRef.current[activeChapterId]?.[index]?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  usePreloadCurrentChapterImages();

  return (
    <div
      className="m-[0_auto] flex flex-col"
      style={{
        gap: gapBetweenItems,
      }}
    >
      <Advertising index={2} />
      {data?.pages.map((page, pageIndex) => (
        <PageContainer
          // isLoading={!loadedMap.has(pageIndex)}
          ref={(ref) => {
            pagesRef.current[activeChapterId] = {
              ...pagesRef.current[activeChapterId],
              [pageIndex]: ref,
            };
          }}
          key={pageIndex}
          onViewLeave={() => {
            utils.remove(pageIndex);
          }}
          onView={() => {
            utils.add(pageIndex);

            if (initScrollState.current !== 'ready') return;
            if (pageIndex && pageIndex === activePageIndex) return;

            setActivePageIndex(pageIndex);
          }}
        >
          {page.map((it) => {
            return (
              <ChapterImageMemoized
                // debug // !READERDEBUG
                model={it}
                key={it.id}
                pageIndex={pageIndex}
              />
            );
          })}
        </PageContainer>
      ))}
      {children}
    </div>
  );
};
