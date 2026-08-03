import { ComponentPropsWithoutRef, memo, ReactNode } from 'react';

import { SkeletonV2 } from '@re/ui-kit/ui/skeleton';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import dayjs from 'dayjs';

import { useSiteConfig } from '~app/providers/site-config-provider';
import type { ChapterFragmentSchema } from '~shared/api/models/chapter';

export interface ChapterItemProps<T extends ChapterFragmentSchema>
  extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  left?: ReactNode;
  right?: ReactNode;
  model?: T;
}

export const ChapterItem = memo(<T extends ChapterFragmentSchema>(props: ChapterItemProps<T>) => {
  const { left, right, model, className, style, ...rest } = props;

  const publisherNames = model?.publishers?.map((v) => v.name) || [];
  const showNewUnread = !model?.viewed && dayjs().diff(dayjs(model?.upload_date), 'day') < 7; // todo: fix ts
  const dateFormat = useSiteConfig((v) => v.localization.dateFormat);

  return (
    <>
      <div
        className={cn(
          'hover-card bg-secondary/50 flex cursor-pointer items-center justify-between overflow-hidden !px-4 !py-2',
          className
        )}
        style={style}
        {...rest}
      >
        <div className="flex items-center gap-4">
          {left}
          <div className="flex items-center gap-4">
            <ReText color="muted-foreground" weight="bold" size="lg">
              {model?.tome}
            </ReText>
            <div className="flex flex-col">
              <ReText component="span">
                Глава {model?.chapter}
                {model?.name ? <>&nbsp;&nbsp;—&nbsp;&nbsp;{model.name}</> : null}
                {showNewUnread ? (
                  <span className="theme-event-not-overridable bg-primary my-0.5 mr-1 ml-2 inline-flex size-1 rounded-full" />
                ) : null}
              </ReText>
              <div className="flex gap-2">
                <ReText size="xs" color="muted-foreground">
                  {publisherNames.length ? publisherNames.join(' & ') : null}
                </ReText>

                <ReText size="xs" color="muted-foreground" className="sm:hidden">
                  {dayjs(model?.upload_date).format(dateFormat)}
                </ReText>
              </div>
            </div>
          </div>
        </div>
        <div className="xs:flex-row flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            {model?.is_free_today ? <ReText>🍪</ReText> : null}
            <ReText size="xs" color="muted-foreground" className="hidden sm:inline">
              {dayjs(model?.upload_date).format(dateFormat)}
            </ReText>
          </div>
          <div>{right}</div>
        </div>
      </div>
    </>
  );
});

export const ChapterItemSkeleton = () => {
  return <SkeletonV2 className="bg-skeleton h-[62px]" />;
};
