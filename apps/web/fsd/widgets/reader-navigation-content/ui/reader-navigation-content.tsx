import type { ComponentProps, ReactNode } from 'react';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { CHAPTER_ASIDE, useChapterAside } from '~entities/chapter/model/store';
import { BACK_ACTION_STRATEGY } from '~entities/reader/model/const';
import { useActiveChapter } from '~entities/reader/model/hooks';
import { useReader, useReaderSettings } from '~entities/reader/model/store';
import { ChaptersContent } from '~pages/(title)/title-detail/ui/title-tabs/chapters/chapters-content';
import { useIsClient } from '~shared/hooks/use-is-client';
import { TransitionableDrawer } from '~shared/lib/drawer/transitionable-drawer';
import { CommentsAsync } from '~widgets/activity/ui/comments.async';
import {
  AsideSettingsContent,
  AsideSettingsHeader,
} from '~widgets/reader-navigation-content/ui/reader-settings';

const AsideComments = (props: { payload?: { chapterId: number; pageIndex: number } }) => {
  const { payload } = props;

  const activeChapterId = useReader((v) => v.activeChapterId);
  const activePageIndex = useReader((v) => v.activePageIndex);

  const chapter_id = payload?.chapterId ?? activeChapterId;
  const chapter_page = payload?.pageIndex ?? activePageIndex + 1;

  return <CommentsAsync target={{ chapter_id, chapter_page }} className="overflow-y-auto" />;
};

const AsideChaptersList = () => {
  const { close } = useChapterAside();

  const { data: chapter } = useActiveChapter();
  const strategy = useReaderSettings((v) => v.value.common.backActionStrategyId);
  const replaceOnChapterNav = strategy === BACK_ACTION_STRATEGY.TITLE;

  return (
    <ChaptersContent
      activeChapterId={chapter?.id}
      initialChapterIndex={chapter?.index}
      onItemClick={close}
      replaceOnChapterNav={replaceOnChapterNav}
    />
  );
};

export const ReaderAsideModal = () => {
  const { state, payload, close } = useChapterAside();
  const isClient = useIsClient();
  const [visualState, setVisualState] = useState<CHAPTER_ASIDE | null>(null);
  const [visualPayload, setVisualPayload] = useState<typeof payload>(null);

  useEffect(() => {
    if (state) {
      setVisualState(state);
      setVisualPayload(payload);
    }
  }, [state, payload]);

  const handleAnimationFinished = () => {
    setVisualState(null);
    setVisualPayload(null);
  };

  const [header, children] = React.useMemo((): readonly [ReactNode, ReactNode] => {
    if (!isClient) return [null, null] as const;

    switch (visualState) {
      case CHAPTER_ASIDE.CHAPTERS:
        return [
          <ReText key={0} size="lg" weight="semibold">
            Список глав
          </ReText>,
          <AsideChaptersList key={1} />,
        ] as const;
      case CHAPTER_ASIDE.COMMENTS:
        return [
          <ReText key={0} size="lg" weight="semibold">
            Комментарии
          </ReText>,
          <AsideComments key={1} payload={visualPayload} />,
        ] as const;
      case CHAPTER_ASIDE.SETTINGS:
        return [<AsideSettingsHeader key={0} />, <AsideSettingsContent key={1} />] as const;
      default:
        return [null, null] as const;
    }
  }, [visualState, visualPayload]);

  if (!isClient) return null;

  return (
    <TransitionableDrawer
      open={!!state}
      onClose={close}
      onCloseAnimationFinished={handleAnimationFinished}
      header={header}
    >
      {children}
    </TransitionableDrawer>
  );
};

interface AsideContainerProps extends ComponentProps<'div'> {}

export const AsideContainer = (props: AsideContainerProps) => {
  const { children, className, style, ...rest } = props;

  return (
    <div className={cn('fixed top-0 right-0 h-dvh', className)} style={style} {...rest}>
      {children}
    </div>
  );
};
