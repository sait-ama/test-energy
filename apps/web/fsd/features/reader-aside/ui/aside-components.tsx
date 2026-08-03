import type { ForwardedRef, ReactNode } from 'react';
import * as React from 'react';
import { forwardRef, useEffect, useRef, useState } from 'react';

import Edit from '@re/ui-kit/icons/edit';
import Like from '@re/ui-kit/icons/like';
import Play from '@re/ui-kit/icons/play';
import Stop from '@re/ui-kit/icons/stop';
import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@re/ui-kit/ui/dropdown-menu';
import { ScrollArea } from '@re/ui-kit/ui/scroll-area';
import { ScrollBar } from '@re/ui-kit/ui/shadow-scroll-area';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useLikeChapter } from '~entities/chapter/model/mutations';
import { useChapter } from '~entities/chapter/model/queries';
import { useActiveChapter } from '~entities/reader/model/hooks';
import {
  useGlobalPages,
  useNoteStore,
  useReader,
  useReaderSettings,
} from '~entities/reader/model/store';
import { CreateNoteInReaderTrigger } from '~features/create-note-in-reader/ui/create-note-in-reader-trigger';
import { useLikeAppereance } from '~features/like-appereance/model/store';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { ContentTypes } from '~shared/config/constants';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { BadgeRoot, BadgeValue } from '~shared/ui/badge-extended';

export const PageIndicatorTrigger = forwardRef(
  (props: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const activePageIndex = useReader((v) => v.activePageIndex);
    const { data } = useActiveChapter();

    const length = data?.pages.length;

    if (!length) return null;

    return (
      <DropdownMenuTrigger asChild>
        <Button circle ref={ref} {...props}>
          {activePageIndex + 1}/{length}
        </Button>
      </DropdownMenuTrigger>
    );
  }
);

export const PageIndicator = DropdownMenu;

export const PageIndicatorContent = () => {
  const { data } = useActiveChapter();
  const pagesRef = useGlobalPages();
  const setActivePageIndexHard = useReader((v) => v.setActivePageIndexHard);
  const length = data?.pages.length ?? 0;
  const handleClick = (pageIndex: number) => {
    if (setActivePageIndexHard) setActivePageIndexHard(pageIndex);
    pagesRef.current?.[data!.id]?.[pageIndex]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DropdownMenuContent>
      <ScrollArea className="h-85">
        <div className="flex flex-col">
          {Array(length)
            .fill('')
            .map((_, idx) => (
              <DropdownMenuItem
                onClick={() => {
                  handleClick(idx);
                }}
                key={idx}
              >
                Страница {idx + 1}
              </DropdownMenuItem>
            ))}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </DropdownMenuContent>
  );
};

interface LikeTriggerProps {
  chapterId: number;
  children: ({ onClick }: { onClick: () => void }) => ReactNode;
}

export const LikeTrigger = (props: LikeTriggerProps) => {
  const { children, chapterId } = props;
  const { data } = useChapter({ variables: { params: { chapter: String(chapterId) } } });
  const { mutateAsync } = useLikeChapter();
  const checkLogged = useLoggedCheck();
  const { startAnimation } = useLikeAppereance();

  const handleLike = checkLogged(async () => {
    if (data?.rated) return;

    try {
      await mutateAsync({
        chapter_ids: [chapterId],
      });
      startAnimation();
    } catch (e: unknown) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return children({ onClick: handleLike });
};

interface LikeIndicatorProps {
  chapterId: number;
}

export const LikeIndicator = (props: LikeIndicatorProps) => {
  const { chapterId } = props;
  const { data } = useChapter({ variables: { params: { chapter: String(chapterId) } } });
  return <Like className={cn({ 'fill-current text-red-700': data?.rated })} />;
};

export const AutoScroll = (props: ButtonProps) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollAnimationFrame = useRef<number | null>(null);
  const scrollSpeedRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);

  const setAutoscrollFunc = useReader((v) => v.setAutoScrollFunc);
  const autoScrollSize = useReaderSettings((v) => v.value.common.autoScrollSize);

  const smoothScroll = (time: number) => {
    if (
      !lastScrollTimeRef.current ||
      time - lastScrollTimeRef.current >= 1000 / scrollSpeedRef.current
    ) {
      window.scrollBy(0, autoScrollSize);
      lastScrollTimeRef.current = time;
    }
    scrollAnimationFrame.current = requestAnimationFrame(smoothScroll);
  };

  const handleAutoScroll = (enabled?: boolean) => {
    if (!enabled) {
      if (scrollAnimationFrame.current) {
        cancelAnimationFrame(scrollAnimationFrame.current);
        scrollAnimationFrame.current = null;
      }
      setIsScrolling(false);
    } else {
      setIsScrolling(true);
      scrollSpeedRef.current = 60;
      scrollAnimationFrame.current = requestAnimationFrame(smoothScroll);
    }
  };

  const handleUserScroll = () => {
    if (isScrolling) {
      handleAutoScroll();
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', handleUserScroll);

    return () => {
      window.removeEventListener('wheel', handleUserScroll);
    };
  }, [isScrolling]);

  useEffect(() => {
    setAutoscrollFunc(() => handleAutoScroll);

    return () => {
      setAutoscrollFunc(null);

      if (scrollAnimationFrame.current) cancelAnimationFrame(scrollAnimationFrame.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrame.current) cancelAnimationFrame(scrollAnimationFrame.current);
    };
  }, []);

  return (
    <Button
      circle
      color="secondary"
      {...props}
      onClick={() => {
        handleAutoScroll(!isScrolling);
      }}
    >
      {isScrolling ? <Stop /> : <Play />}
    </Button>
  );
};

interface CommentsCountIndicatorProps {
  children?: ReactNode;
  asBadge?: boolean;
}

export const CommentsCountIndicator = (props: CommentsCountIndicatorProps) => {
  const { children, asBadge } = props;
  const activePageIndex = useReader((v) => v.activePageIndex);
  const { data } = useActiveChapter();
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const contentType = useContentType();

  if (contentType !== ContentTypes.MANGA) return children;

  const count = data?.pages[activePageIndex]?.[0]?.count_comments ?? 0;

  if (asBadge) {
    return (
      <BadgeRoot>
        {children}
        {count && title.can_post_comments ? (
          <BadgeValue
            className={cn('-top-1/4 -right-1/4', {
              'top-[-35%] right-[-35%]': count > 100,
            })}
          >
            {count}
          </BadgeValue>
        ) : null}
      </BadgeRoot>
    );
  }

  if (!title.can_post_comments) return null;

  return count;
};

export const DesktopEditNoteIndicator = () => {
  const { isOpen } = useNoteStore();

  return (
    <CreateNoteInReaderTrigger>
      <Button circle variant={isOpen ? 'default' : 'secondary'}>
        <Edit />
      </Button>
    </CreateNoteInReaderTrigger>
  );
};

export const MobileEditNoteIndicator = () => {
  return (
    <CreateNoteInReaderTrigger>
      <DropdownMenuItem>Заметка</DropdownMenuItem>
    </CreateNoteInReaderTrigger>
  );
};
