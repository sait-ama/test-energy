'use client';

import type {ReactNode} from 'react';
import {useEffect} from 'react';

import {useCurrentChapter} from '~entities/reader/model/hooks';
import {
  useClickableAreaHandlers,
  useGlobalPages,
  useHeaderVisibility,
  useItemsInView,
  usePreloadCurrentChapterImages,
  useReader,
} from '~entities/reader/model/store';
import {ChapterImage} from '~entities/reader/ui/chapter-image';

export const PagerReader = ({children}: { children: ReactNode }) => {
    const {data} = useCurrentChapter();
    const {utils} = useItemsInView();
    const activePageIndex = useReader((v) => v.activePageIndex);
    const activeChapterId = useReader((v) => v.activeChapterId);
    const setActivePageIndexHardFunc = useReader((v) => v.setActivePageIndexHardFunc);
    const setActivePageIndex = useReader((v) => v.setActivePageIndex);
    const setActiveChapterIdHard = useReader((v) => v.setActiveChapterIdHard);
    const registerActions = useClickableAreaHandlers((v) => v.registerActions);
    const handleMenu = useHeaderVisibility((v) => v.toggle);
    const length = data?.pages.length;
    const pagesRef = useGlobalPages();

    useEffect(() => {
        utils.clear();
        utils.add(activePageIndex);
    }, [activePageIndex]);

    useEffect(() => {
        registerActions({
            onMenu: () => {
                handleMenu();
            },
            onNext: () => {
                if (activePageIndex + 1 < length) {
                    window.scrollTo(0, 0);
                    setActivePageIndex(activePageIndex + 1);
                }

                if (activePageIndex + 1 === length && data.next.id) {
                    setActiveChapterIdHard(data.next.id);
                }
            },
            onPrev: () => {
                if (activePageIndex > 0) {
                    window.scrollTo(0, 0);
                    setActivePageIndex(activePageIndex - 1);
                }

                if (activePageIndex === 0 && data.previous.id) {
                    setActiveChapterIdHard(data.previous.id);
                }
            },
        });
    }, [activePageIndex]);

    useEffect(() => {
        setActivePageIndexHardFunc(() => setActivePageIndex);
    }, []);

    usePreloadCurrentChapterImages();

    return (
        <div
            className="m-[0 auto] flex flex-col"
            ref={(ref) => {
                pagesRef.current[activeChapterId] = {[activePageIndex]: ref};
            }}
        >
            {data?.pages[activePageIndex]?.map((it) => (
                <ChapterImage
                    // debug // !READERDEBUG
                    model={it}
                    key={it.id}
                    pageIndex={activePageIndex}
                />
            ))}
            {children}
        </div>
    );
};
