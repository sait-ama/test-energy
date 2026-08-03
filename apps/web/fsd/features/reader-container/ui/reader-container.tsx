import type { ComponentPropsWithoutRef } from 'react';
import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

import { produce } from 'immer';
import { useMergeRefs } from 'use-callback-ref';

import { useContentType } from '~app/providers/site-config-provider';
import { useChapterAside } from '~entities/chapter/model/store';
import { HotkeyAction } from '~entities/reader/model/const';
import { useActiveChapter } from '~entities/reader/model/hooks';
import {
  useChapterId,
  useGlobalInView,
  useGlobalPages,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { useLikeFeatures } from '~features/reader-container/model/hooks';
import { useSettingViews } from '~features/reader-main-settings/ui/reader-main-settings';
import { ContentTypes } from '~shared/config/constants';
import { createHotkey, transformRawHotkey } from '~shared/lib/hotkey/hot-key-single';
import { canUseHotkeys, useHotkeyLock } from '~shared/lib/hotkey/hotkey-lock';
import { mergeProps } from '~shared/lib/react/merge-props';
import { cn } from '~shared/utils/cn';
import { noop } from '~shared/utils/noop';

const useHotkeyListener = () => {
  const hotkeysObj = useReaderSettings((v) => v.value.common.hotkeys);
  const setReaderSettings = useReaderSettings((v) => v.onValueChange);
  const readerType = useReaderSettings((v) => v.value.manga.readerType);
  const contentType = useContentType();
  const { data } = useActiveChapter();
  const setActiveChapterIdHard = useReader((v) => v.setActiveChapterIdHard);
  const setActivePageIndex = useReader((v) => v.setActivePageIndex);
  const activePageIndex = useReader((v) => v.activePageIndex);
  const activeChapterId = useReader((v) => v.activeChapterId);
  const pagesRef = useGlobalPages();
  const { value: view } = useSettingViews();

  const hotkey2Actions = Object.keys(hotkeysObj).reduce<Record<string, HotkeyAction>>(
    (acc, action) => {
      for (const rawHotkey of hotkeysObj[action as unknown as HotkeyAction]) {
        const transformedHotkey = transformRawHotkey(rawHotkey)!;

        if (!transformedHotkey) continue;

        acc[transformedHotkey.identifier] = action as unknown as HotkeyAction;
      }
      return acc;
    },
    {}
  );

  const actionsMap: Record<HotkeyAction, VoidFunction> = {
    [HotkeyAction.NEXT_CHAPTER]: () => {
      if (data?.next.id) setActiveChapterIdHard(data.next.id);
    },
    [HotkeyAction.PREV_CHAPTER]: () => {
      if (data?.previous.id) setActiveChapterIdHard(data.previous.id);
    },
    [HotkeyAction.PREV_PAGE]: () => {
      if (activePageIndex - 1 < 0) return;

      if (contentType === ContentTypes.MANGA) {
        pagesRef.current?.[activeChapterId]?.[activePageIndex - 1]?.scrollIntoView({
          behavior: 'smooth',
        });

        if (readerType === 'pager') {
          window.scrollTo(0, 0);
        }
      }
      setActivePageIndex(activePageIndex - 1);
    },
    [HotkeyAction.NEXT_PAGE]: () => {
      if (activePageIndex + 1 >= (data?.pages?.length ?? 0)) return;
      if (contentType === ContentTypes.MANGA) {
        pagesRef.current?.[activeChapterId]?.[activePageIndex + 1]?.scrollIntoView({
          behavior: 'smooth',
        });

        if (readerType === 'pager') {
          window.scrollTo(0, 0);
        }
      }

      setActivePageIndex(activePageIndex + 1);
    },
    [HotkeyAction.SCROLL_TOP]: noop,
    [HotkeyAction.SCROLL_BOTTOM]: noop,
    [HotkeyAction.INCREASE_CONTAINER_WIDTH]: () =>
      setReaderSettings((settings) =>
        produce(settings, (draft) => {
          if (!draft.common) return;

          draft.common.containerWidth = Math.min(draft.common.containerWidth + 10, 200);
        })
      ),
    [HotkeyAction.DECREASE_CONTAINER_WIDTH]: () =>
      setReaderSettings((settings) =>
        produce(settings, (draft) => {
          if (!draft.common) return;

          draft.common.containerWidth = Math.max(draft.common.containerWidth - 10, 10);
        })
      ),
  };
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const hotkey = createHotkey(event);
      const transformedHotkey = transformRawHotkey(hotkey);
      const action = transformedHotkey?.identifier
        ? hotkey2Actions[transformedHotkey.identifier]
        : null;

      if (action && !view && canUseHotkeys()) {
        const handler = actionsMap[action];

        if (handler && !document.body.attributes.getNamedItem('data-scroll-locked')) handler();
      }
    };

    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [data, activePageIndex, readerType, hotkeysObj, view]);
};

interface ReaderContainerProps extends ComponentPropsWithoutRef<'div'> {}

export const ReaderContainer = (props: ReaderContainerProps) => {
  const { children, ...rest } = props;
  const activeChapterRef = useReader((v) => v.activeChapterRef);
  const initialPageIndex = useReader((v) => v.initialPageIndex);
  const chapterId = useChapterId();
  const isAsideOpen = !!useChapterAside((v) => v.state);
  const autoLoad = useReaderSettings((v) => v.value.common.autoLoad);
  const setActiveChapterId = useReader((v) => v.setActiveChapterId);
  const activeChapterId = useReader((v) => v.activeChapterId);
  const containerRef = useRef<HTMLDivElement>(null);
  const map = useGlobalInView((v) => v.map);

  const [ref, inView] = useInView({ skip: !autoLoad });

  useHotkeyLock({ shouldLock: isAsideOpen });

  useEffect(() => {
    if (inView) setActiveChapterId(chapterId);
  }, [inView, chapterId, map]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleSaveOffset = () => {
      if (!containerRef.current) return;
      const restoreValue = -containerRef.current.getBoundingClientRect().top;
      localStorage.setItem('chScrollY', `${chapterId}@${restoreValue}`);
    };

    window.addEventListener('pagehide', handleSaveOffset, true);
    return () => {
      window.removeEventListener('pagehide', handleSaveOffset);
    };
  }, []);

  useEffect(() => {
    if (initialPageIndex) return;
    if (activeChapterId !== chapterId || !containerRef.current) return;

    const stored = localStorage.getItem('chScrollY') ?? '';
    const [key, scrollY] = stored.split('@').map(Number);

    if (key !== chapterId) return;

    window.scroll(0, scrollY ?? 0);
  }, []);

  const bind = useLikeFeatures();

  const merged = mergeProps(bind, rest);

  useHotkeyListener();

  const combinedRefs = useMergeRefs([ref, activeChapterRef, containerRef]);

  return (
    <div
      {...merged}
      ref={combinedRefs}
      className={cn('relative transition-all duration-500', isAsideOpen ? 'xl:mr-75' : '')}
    >
      {children}
    </div>
  );
};
