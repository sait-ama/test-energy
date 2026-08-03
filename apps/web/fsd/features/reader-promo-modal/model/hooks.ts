import { useEffect } from 'react';

import { useActiveChapter } from '~entities/reader/model/hooks';

import { useReaderPromoModalStore } from './store';

export const useReaderPromoModalAcc = () => {
  const addChapterRead = useReaderPromoModalStore((v) => v.addChapterRead);
  const { data: chapter } = useActiveChapter();

  const chapterId = chapter?.id;

  useEffect(() => {
    if (chapter && !chapter.is_paid) {
      const timeout = setTimeout(() => {
        addChapterRead(chapter.id);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [chapterId]);
};
