import { memo } from 'react';
import { useTranslations } from 'next-intl';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useCurrentChapter } from '~entities/reader/model/hooks';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { TitlesStatuses } from '~shared/api/models/title';

export interface LastChapterTextProps {
  className?: string;
}

export const LastChapterText = memo((props: LastChapterTextProps) => {
  const { className } = props;

  const t = useTranslations('pages.reader.footer');

  const { data: activeTitle } = useCurrentPageSuspenseTitleDetail();
  const { data: activeChapter } = useCurrentChapter();

  const isLastChapter = !activeChapter?.next?.id;

  if (!isLastChapter) return null;

  const status = activeTitle?.status;
  const nextChapterDateString = activeTitle?.branches?.[0]?.new_chapter_date;
  const nextChapterDate = nextChapterDateString ? new Date(nextChapterDateString) : '';

  const getChaptersReleaseStatus = () => {
    if (status?.id === TitlesStatuses.ONGOING || status?.id === TitlesStatuses.LICENSED) {
      return nextChapterDate ? 'hasNextDate' : 'ongoing';
    }

    return 'ended';
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <ReText size="xl" weight="semibold">
        Это последняя глава
      </ReText>
      <ReText color="muted-foreground" align="center">
        {t.rich('last-chapter-text', {
          nextChapterDate,
          status: status.name?.toLowerCase(),
          chaptersReleaseStatus: getChaptersReleaseStatus(),
          emph: (text) => <span className="text-foreground">{text}</span>,
        })}
      </ReText>
    </div>
  );
});
