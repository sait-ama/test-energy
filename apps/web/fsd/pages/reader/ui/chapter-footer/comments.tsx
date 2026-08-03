import { memo } from 'react';

import ExternalLink from '@re/ui-kit/icons/external-link';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { CHAPTER_ASIDE, useChapterAside } from '~entities/chapter/model/store';
import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useReaderSettings } from '~entities/reader/model/store';
import { ChapterFooterComments } from '~widgets/activity/ui/chapter-footer-comments';

export interface CommentsProps {
  className?: string;
}

export const Comments = memo((props: CommentsProps) => {
  const { className } = props;

  const { data: chapter } = useCurrentChapter();
  const { toggle } = useChapterAside();

  const readerType = useReaderSettings((v) => v.value.manga.readerType);

  if (readerType === 'pager') return null;

  const target = {
    chapter_id: chapter.id,
    chapter_page: -1,
  };

  return (
    <section className={cn('mt-4 w-full', className)}>
      <header className="flex justify-between">
        <ReText size="lg" weight="semibold">
          Самые интересные комментарии
        </ReText>
        <Button
          onClick={() =>
            toggle({
              state: CHAPTER_ASIDE.COMMENTS,
              payload: { chapterId: chapter?.id, pageIndex: -1 },
            })
          }
          variant="outline"
          circle
          size="sm"
          className="hover:border-primary group transition-all duration-300"
        >
          <ExternalLink className="text-muted-foreground group-hover:text-primary transition-all duration-300" />
        </Button>
      </header>
      <ChapterFooterComments target={target} query={{ count: 3 }} className="mt-6" />
    </section>
  );
});
