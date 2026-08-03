import type { HTMLAttributes, JSX, ReactNode } from 'react';
import { memo } from 'react';
import isEqual from 'react-fast-compare';

import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { ActivityListContext, useActivityListContext } from '~entities/activity/model/context';
import { useActivityListSuspenseQuery } from '~entities/activity/model/queries';
import { useActivityService, UseActivityServiceOptions } from '~entities/activity/model/service';
import { ActivityItemSkeletonList } from '~entities/activity/ui/activity-item-skeleton-list';
import type {
  Activity,
  ActivityTargetQuerySchema,
  CommentSchema,
  QueryFn,
} from '~shared/api/models/activity';
import { EmptyView } from '~shared/ui/empty-view';

interface RenderItemProps {
  isSublist?: boolean;
}

type RenderItem = (item: Activity, itemProps?: RenderItemProps) => ReactNode;

interface ActivityListProps {
  renderItem: RenderItem;
  skeletonItemsCount?: number;
  SkeletonItem: () => JSX.Element;
}

const visibilityFilter = (comment: CommentSchema) => comment.left_by?.id !== -1;

const MemoizedActivityItem = memo(
  ({
    renderItem,
    item,
    props,
  }: {
    renderItem: RenderItem;
    item: Activity;
    props?: RenderItemProps;
  }) => renderItem(item, props),
  (p, n) => isEqual(p.item, n.item) && p.renderItem === n.renderItem
);

const ActivityListPage = ({
  content,
  renderItem,
  itemProps,
}: {
  content: Activity[];
  renderItem: RenderItem;
  itemProps?: RenderItemProps;
}): ReactNode =>
  content.map((item) => (
    <MemoizedActivityItem key={item.id} item={item} renderItem={renderItem} props={itemProps} />
  ));

const MemoizedActivityListPage = memo(
  ActivityListPage,
  (p, n) => p.content === n.content
) as typeof ActivityListPage;

const ActivityListProvider = <
  Target extends ActivityTargetQuerySchema,
  GetUrlFunc extends QueryFn,
>({
  children,
  value,
}: {
  children: ReactNode;
  value: UseActivityServiceOptions<Target, GetUrlFunc>;
}) => {
  const context = useActivityService(value);

  return <ActivityListContext.Provider value={context}>{children}</ActivityListContext.Provider>;
};

const ActivityListContainer = ({ children, className }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex w-full flex-col items-start gap-4', className)}>{children}</div>
);

const ActivityListContentPrevButton = ({
  SkeletonItem,
}: Pick<ActivityListProps, 'SkeletonItem'>) => {
  const { queryFn, target, query } = useActivityListContext();

  const service = useActivityListSuspenseQuery(
    { variables: { params: target, query } },
    {
      queryFn: ({ pageParam }) =>
        queryFn({ params: target, query: { ...query, ...target, page: pageParam } }),
    }
  );

  if (!service.data?.pages.length && !service.isLoading) return null;

  const renderFetchPreviousButton = () =>
    service.hasPreviousPage ? (
      <Button variant="link" onClick={() => service.fetchPreviousPage()}>
        Показать предыдущие
      </Button>
    ) : null;

  return service.isFetchingPreviousPage ? (
    <>
      <div className="h-4 w-8" />
      <ActivityItemSkeletonList SkeletonItem={SkeletonItem} count={5} />
    </>
  ) : (
    renderFetchPreviousButton()
  );
};
const ActivityListContentNextButton = ({
  SkeletonItem,
}: Pick<ActivityListProps, 'SkeletonItem'>) => {
  const { queryFn, target, query } = useActivityListContext();

  const service = useActivityListSuspenseQuery(
    { variables: { params: target, query } },
    {
      queryFn: ({ pageParam }) =>
        queryFn({ params: target, query: { ...query, ...target, page: pageParam } }),
    }
  );

  if (!service.data?.pages.length && !service.isLoading) {
    return null;
  }

  const renderFetchNextButton = () =>
    service.hasNextPage ? (
      <Button variant="link" onClick={() => service.fetchNextPage()}>
        Показать еще
      </Button>
    ) : null;

  return service.isFetchingNextPage ? (
    <ActivityItemSkeletonList SkeletonItem={SkeletonItem} count={5} />
  ) : (
    renderFetchNextButton()
  );
};

export const ActivityListContentItems = ({ renderItem }: Pick<ActivityListProps, 'renderItem'>) => {
  const { queryFn, target, query } = useActivityListContext();

  const service = useActivityListSuspenseQuery(
    { variables: { params: target, query } },
    {
      queryFn: ({ pageParam }) =>
        queryFn({ params: target, query: { ...query, ...target, page: pageParam } }),
    }
  );

  if (!service.data?.pages.length && !service.isLoading) {
    return <EmptyView />;
  }

  const content = service.data?.pages.map((it) => it.results);

  return content.map((page, index) => (
    <MemoizedActivityListPage key={index} content={page} renderItem={renderItem} />
  ));
};

const ActivityListContent = ({ renderItem, SkeletonItem }: ActivityListProps) => (
  <>
    <ActivityListContentPrevButton SkeletonItem={SkeletonItem} />
    <ActivityListContentItems renderItem={renderItem} />
    <ActivityListContentNextButton SkeletonItem={SkeletonItem} />
  </>
);
export const ActivityList = Object.assign(ActivityListProvider, {
  Content: ActivityListContent,
  Container: ActivityListContainer,
});
