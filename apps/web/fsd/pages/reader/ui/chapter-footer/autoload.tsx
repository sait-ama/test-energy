import { memo } from 'react';
import Link from 'next/link';

import ChevronLeftIcon from '@re/ui-kit/icons/chevron-left';
import ChevronRightIcon from '@re/ui-kit/icons/chevron-right';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { useActiveChapter } from '~entities/reader/model/hooks';
import { useReaderSettings } from '~entities/reader/model/store';
import { useCurrentPageSuspenseTitleDetail } from '~pages/(title)/title-detail/model/queries';
import { Routing } from '~shared/config/routing';

export const AutoloadActions = memo(({ className }: { className?: string }) => {
  const autoLoad = useReaderSettings((v) => v.value.common.autoLoad);
  const { data: chapter } = useActiveChapter();
  const contentType = useContentType();
  const { data: title } = useCurrentPageSuspenseTitleDetail();

  return !autoLoad && title ? (
    <div className={cn('flex w-full justify-between gap-2 md:pb-0', className)}>
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
        >
          <Button variant="outline" startIcon={<ChevronLeftIcon />}>
            Назад
          </Button>
        </Link>
      ) : null}

      <Link
        href={Routing.Title.detail({
          params: {
            dir: title.dir,
            content: contentType,
            tab: 'main',
          },
        })}
      >
        <Button>К тайтлу</Button>
      </Link>

      {chapter?.next?.id ? (
        <Link
          href={Routing.Chapter.main({
            params: {
              titleDir: title.dir,
              id: chapter?.next?.id,
              content: contentType,
            },
          })}
          prefetch={false}
        >
          <Button variant="outline" endIcon={<ChevronRightIcon />}>
            Вперед
          </Button>
        </Link>
      ) : null}
    </div>
  ) : null;
});

AutoloadActions.displayName = 'AutoloadActions';
