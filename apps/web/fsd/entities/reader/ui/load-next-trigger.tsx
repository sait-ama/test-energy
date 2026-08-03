import React, { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@re/ui-kit/utils/cn';

import { useActiveChapter } from '~entities/reader/model/hooks';
import { useInfiniteReaderChapters, useReaderSettings } from '~entities/reader/model/store';

import { READER_MAX_CHAPTERS } from '../model/const';

export const LoadNextChapterTrigger = () => {
  const autoLoad = useReaderSettings((v) => v.value.common.autoLoad);
  const { data } = useActiveChapter();
  const setChapters = useInfiniteReaderChapters((v) => v.__dangerously_setChapters);

  const canTrigger = Boolean(autoLoad && data?.next?.id);
  const [inView, setInView] = useState(false);
  const [inViewRef] = useInView({ threshold: 0.75, onChange: setInView });

  useEffect(() => {
    if (inView && canTrigger) {
      setChapters((prev) =>
        Array.from(new Set([...prev, data!.next.id])).slice(-READER_MAX_CHAPTERS)
      );
    }
  }, [inView, canTrigger, data]);

  return <div className={cn('h-10 w-10')} ref={inViewRef} />;
};
