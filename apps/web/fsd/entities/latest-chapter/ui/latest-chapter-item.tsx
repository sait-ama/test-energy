import * as React from 'react';
import Link from 'next/link';
import { useFormatter, useNow } from 'next-intl';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { useContentType } from '~app/providers/site-config-provider';
import { TITLE_PREVIEW_SIZE } from '~entities/title/model/consts';
import { TitleImage } from '~entities/title/ui/title-image';
import type { LatestChapterSchema } from '~shared/api/models/latest-chapter';
import { Routing } from '~shared/config/routing';

interface LatestChaptersItemProps {
  model: LatestChapterSchema;
  isLoading?: boolean;
  imgClassName?: string;
  baseDomain?: string;
}

export const LatestChapterItem = (props: LatestChaptersItemProps) => {
  const content = useContentType();
  const { model, isLoading, baseDomain } = props;
  const formatter = useFormatter();
  const now = useNow();

  return (
    <Link
      href={Routing.Title.detail({
        params: {
          dir: model.title?.dir,
          tab: Routing.Title.TitleDetailTabs.MAIN,
          content,
        },
      })}
      prefetch={false}
      title={model.title?.main_name}
      data-id={model?.id}
      className={cn(
        'bg-card flex w-full flex-row items-center justify-between gap-4 !rounded-md p-3',
        !isLoading && 'dark:hover:border-primary dark:hover:bg-card'
      )}
    >
      <div className="flex w-full items-center gap-4">
        <TitleImage
          isLoading={isLoading}
          src={model.title?.cover?.[TITLE_PREVIEW_SIZE]}
          alt={model.title?.main_name}
          fill
          priority
          className="w-12 lg:w-16"
        />
        <div className="w-full space-y-2">
          <ReText lineClamp={2} color="foreground" size="md" weight="semibold">
            <SkeletonSlot count={0.5} show={isLoading} render={model.title?.main_name} />
          </ReText>
          <ReText lineClamp={2} size="sm" color="muted-foreground">
            <SkeletonSlot
              count={0.25}
              show={isLoading}
              render={
                <>
                  Том {model?.tome} Глава {model?.chapter}
                </>
              }
            />
          </ReText>
        </div>
      </div>
      <ReText size="xs" className="text-muted-foreground pr-2 text-nowrap">
        <SkeletonSlot
          count={0.5}
          show={isLoading}
          render={() => formatter.relativeTime(new Date(model.upload_date), now)}
        />
      </ReText>
    </Link>
  );
};
