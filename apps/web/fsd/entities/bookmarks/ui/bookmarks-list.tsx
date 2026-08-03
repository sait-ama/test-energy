import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { Spinner } from '@re/ui-kit/ui/spinner';
import { cn } from '@re/ui-kit/utils/cn';

import { useUserBookmarksTypes } from '~entities/user/model/queries';
import type { EndpointMeta } from '~shared/api/api-toolkit';
import type {
  UserBookmarksTypesPaginatedListParamsSchema,
  UserBookmarksTypesPaginatedListQuerySchema,
  UserBookmarkType,
} from '~shared/api/models/user';

interface BookmarksListProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: ({ values }: { values: UserBookmarkType[] }) => ReactNode;
  variables: EndpointMeta<
    UserBookmarksTypesPaginatedListParamsSchema,
    UserBookmarksTypesPaginatedListQuerySchema
  >;
}

export const BookmarksList = (props: BookmarksListProps) => {
  const { children, variables, className, ...rest } = props;
  const { data, isLoading } = useUserBookmarksTypes({ variables });

  return (
    <div className={cn('flex flex-col gap-2', className)} {...rest}>
      {isLoading ? <Spinner /> : children({ values: data!.results })}
    </div>
  );
};
