import type { HTMLAttributes } from 'react';
import * as React from 'react';
import { Fragment } from 'react';
import { useFormatter } from 'next-intl';

import Pin from '@re/ui-kit/icons/pin';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import {
  ActivityItemContext,
  isActivityWithPinnedState,
  useActivityBaseAPI,
  useActivityItemContext,
} from '~entities/activity/model/context';
import { getColorByScore } from '~entities/activity/ui/utils';
import type { Activity } from '~shared/api/models/activity';
import { SpoiledText, SpoilerContent } from '~shared/ui/spoiled-text';

interface ActivityItemProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Activity;
}

const ActivityItemRoot = React.forwardRef<HTMLDivElement, ActivityItemProps>((props, ref) => {
  const { data, className, children, ...rest } = props;

  return (
    <ActivityItemContext.Provider
      value={{
        data,
      }}
    >
      <div
        ref={ref}
        className={cn('cs-comment-item relative flex w-full flex-row items-start gap-3', className)}
        {...rest}
      >
        {children}
      </div>
    </ActivityItemContext.Provider>
  );
});
ActivityItemRoot.displayName = 'ActivityItem';

const ActivityItemCard = ({ children, className }: HTMLAttributes<HTMLDivElement>) => {
  const { data } = useActivityItemContext();

  return (
    <div
      style={{ borderLeft: `2px solid ${getColorByScore(data.score)}` }}
      className={cn(
        'bg-secondary dark:bg-background border-border text-card-foreground w-full rounded-sm border py-2 pr-2 pl-3',
        className,
        data.is_pinned && 'border-border border-[3px]'
      )}
    >
      {children}
    </div>
  );
};

const ActivityItemContent = () => {
  const { data } = useActivityItemContext();

  const setIsStickerSingle = useActivityBaseAPI();
  const Container = data.is_spoiler ? SpoilerContent : Fragment;
  return (
    <div className={cn('break-words')}>
      <Container>
        <SpoiledText
          onStickerFound={() => {
            setTimeout(() => {
              setIsStickerSingle(true);
            }, 0);
          }}
        >
          {data.text}
        </SpoiledText>
      </Container>
    </div>
  );
};

const ActivityItemHeader = ({ children, className }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mb-1 flex flex-row items-center gap-2', className)}>{children}</div>
);
const ActivityItemFooter = ({ children, className }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center px-1', className)}>{children}</div>
);

const ActivityDate = ({ className }: HTMLAttributes<HTMLDivElement>) => {
  const { data } = useActivityItemContext();
  const formatter = useFormatter();
  // second option for publisher comments, delete
  const commentDate =
    typeof data.date === 'number'
      ? new Date(new Date().getTime() - data.date)
      : new Date(data.date);
  return (
    <span className={cn('text-muted-foreground text-xs', className)}>
      {formatter.relativeTime(commentDate, new Date())}
    </span>
  );
};

const ContextConsumer = ({ children }) => {
  const context = useActivityItemContext();

  if (typeof children !== 'function') {
    throw new Error('Children inside ActivityItem-ContextConsumer must be a function');
  }

  return children(context);
};

const ActivityPinned = () => {
  const { data } = useActivityItemContext();
  if (!isActivityWithPinnedState(data)) return null;
  if (!data.is_pinned) return null;

  return (
    <Pin className="text-muted-foreground text-weight -mt-0.5 text-xs leading-none" />
    // <ReText size="xs" color="muted-foreground" weight="semibold" className="-mt-0.5 leading-none">
    //     закреплено
    // </ReText>
  );
};

const ActivityLeftBy = () => {
  const { data } = useActivityItemContext();

  if (data?.left_by?.id === 1) return null;

  return (
    <ReText size="xs" color="muted-foreground" weight="semibold" className="-mt-0.5 leading-none">
      {data?.left_by?.name?.toLowerCase?.()}
    </ReText>
  );
};

export const ActivityItem = Object.assign(ActivityItemRoot, {
  Context: ActivityItemContext,
  ContextConsumer: ContextConsumer,
  Card: ActivityItemCard,
  Content: ActivityItemContent,
  Header: ActivityItemHeader,
  Footer: ActivityItemFooter,
  Date: ActivityDate,
  Pinned: ActivityPinned,
  LeftBy: ActivityLeftBy,
  // useContext: usePostStore,
});
