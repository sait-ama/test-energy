import { memo } from 'react';

import confetti from 'canvas-confetti';

import UnlikedIcon from '@re/ui-kit/icons/heart';
import LikedIcon from '@re/ui-kit/icons/heart-contained';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useReader } from '~entities/reader/model/store';
import { useReaderSettings } from '~entities/reader/model/store';
import { Advertising } from '~features/reader-ad/ui/reader-ad';
import { LikeTrigger } from '~features/reader-aside/ui/aside-components';
import { useLoggedCheck } from '~shared/lib/session/use-logged';
import { Container } from '~shared/ui/container';

import { AutoloadActions } from './autoload';
import { Comments } from './comments';
import { LastChapterText } from './last-chapter-text';
import { PublisherTipsButton } from './publisher-tips';
import { RatingButton } from './rating';
import { SimilarSlider } from './similar';

const Actions = memo(({ className }: { className?: string }) => {
  const { data: chapter } = useCurrentChapter();
  const checkLogged = useLoggedCheck();

  return (
    <div className={cn('flex items-center justify-center gap-2 md:gap-6', className)}>
      <RatingButton />
      <LikeTrigger chapterId={chapter?.id}>
        {({ onClick }) => {
          const handleClick = checkLogged(() => {
            confetti();
            onClick();
          });

          return (
            <Button
              size="lg"
              onClick={handleClick}
              /* disabled={!!chapter?.rated} */ startIcon={
                chapter?.rated ? <LikedIcon /> : <UnlikedIcon />
              }
            >
              Спасибо ({chapter?.score})
            </Button>
          );
        }}
      </LikeTrigger>
      <PublisherTipsButton />
    </div>
  );
});

Actions.displayName = 'Actions';

export const ChapterFooter = memo(() => {
  const { data: chapter } = useCurrentChapter();

  const readerType = useReaderSettings((v) => v.value.manga.readerType);
  const activePageIndex = useReader((v) => v.activePageIndex) || 0;

  if (readerType === 'pager' && activePageIndex + 1 !== chapter.pages.length) return null;

  return (
    <Container slim className="z-[1000]">
      <div className="md:mx-12">
        <Advertising index={1} />
        <LastChapterText className="mt-12" />
        <Actions className="mt-12" />
        <SimilarSlider className="mt-6" />
        <AutoloadActions className="mt-6" />
        <Comments className="mt-8" />
      </div>
    </Container>
  );
});

ChapterFooter.displayName = 'ChapterFooter';
