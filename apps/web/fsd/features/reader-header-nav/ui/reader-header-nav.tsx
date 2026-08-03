import * as React from 'react';
import Link from 'next/link';

import ChevronLeft from '@re/ui-kit/icons/chevron-left';
import ChevronRight from '@re/ui-kit/icons/chevron-right';
import { Button } from '@re/ui-kit/ui/button';
import { Spinner } from '@re/ui-kit/ui/spinner';

import { useContentType } from '~app/providers/site-config-provider';
import { CHAPTER_ASIDE } from '~entities/chapter/model/store';
import { BACK_ACTION_STRATEGY } from '~entities/reader/model/const';
import { useActiveChapter } from '~entities/reader/model/hooks';
import { useReaderSettings } from '~entities/reader/model/store';
import { AsideTrigger } from '~entities/reader/ui/aside';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { Routing } from '~shared/config/routing';

export const HeaderChapterNavigation = () => {
  const contentType = useContentType();
  const { data: chapter, isLoading } = useActiveChapter();
  const { data: title } = useCurrentPageSuspenseTitleDetail();
  const strategy = useReaderSettings((v) => v.value.common.backActionStrategyId);
  const chapterLinkReplace = strategy === BACK_ACTION_STRATEGY.TITLE;

  return (
    <div className="flex h-full items-center">
      <div className="border-border flex items-center justify-center gap-1 rounded-full border">
        {chapter?.previous?.id ? (
          <Link
            href={Routing.Chapter.main({
              params: {
                titleDir: title!.dir,
                id: chapter?.previous?.id,
                content: contentType,
              },
            })}
            prefetch={false}
            replace={chapterLinkReplace}
          >
            <Button variant="ghost" circle>
              <ChevronLeft />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" disabled circle>
            <ChevronLeft />
          </Button>
        )}

        <AsideTrigger value={CHAPTER_ASIDE.CHAPTERS}>
          <Button variant="ghost" disabled={isLoading} className="px-2">
            {isLoading ? (
              <Spinner />
            ) : (
              <>
                {chapter?.tome} - {chapter?.chapter}
              </>
            )}
          </Button>
        </AsideTrigger>
        {chapter?.next?.id ? (
          <Link
            prefetch={false}
            href={Routing.Chapter.main({
              params: {
                titleDir: title!.dir,
                id: chapter?.next?.id,
                content: contentType,
              },
            })}
            replace={chapterLinkReplace}
          >
            <Button variant="ghost" circle>
              <ChevronRight />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" disabled circle>
            <ChevronRight />
          </Button>
        )}
      </div>
    </div>
  );
};
