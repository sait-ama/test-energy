import type { KeyboardEvent } from 'react';
import { useCallback, useEffect } from 'react';

import { useDoubleTap } from 'use-double-tap';

import { useLikeChapter } from '~entities/chapter/model/mutations';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useReader } from '~entities/reader/model/store';
import { useLikeAppereance } from '~features/like-appereance/model/store';
import { canUseHotkeys } from '~shared/lib/hotkey/hotkey-lock';
import { useLogged } from '~shared/lib/session/use-logged';

export const useLikeFeatures = () => {
  const activeChapterId = useReader((v) => v.activeChapterId);
  const { mutateAsync } = useLikeChapter();
  const { data } = useCurrentChapter();
  const isLogged = useLogged();
  const { startAnimation } = useLikeAppereance();

  const callback = useCallback(async () => {
    if (!canUseHotkeys() || !isLogged || data.rated) return;
    startAnimation();
    await mutateAsync({
      chapter_ids: [activeChapterId],
    });
  }, [data, isLogged]);

  const bind = useDoubleTap(callback);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e?.key?.toLowerCase() === 'f' || e?.key?.toLowerCase() === 'а') {
        await callback();
      }
    };

    // @ts-ignore
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // @ts-ignore
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback]);

  return bind;
};
