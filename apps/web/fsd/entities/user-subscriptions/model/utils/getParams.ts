import { followersOrdering } from '~entities/user-subscriptions/model/consts';
import type { FollowersPaginatedListQuerySchema } from '~shared/api/models/follower';
import type {
  SubContentType,
  UserSubscriptionsPaginatedListQuerySchema,
} from '~shared/api/models/user-subscriptions';
import type { NextPageParams } from '~shared/types/next';

type QueryParams = Pick<UserSubscriptionsPaginatedListQuerySchema, 'sub_type' | 'ordering'> & {
  user_id: number;
};
type FollowersQueryParams = FollowersPaginatedListQuerySchema;
export const getSubscriptionsPaginatedListQueryParams = (
  params: Record<string, string | string[] | undefined> | null,
  searchParams: Record<string, string | string[] | undefined> | undefined | null
) => {
  //@ts-ignore
  const query = searchParams as Omit<QueryParams, 'user_id'> & { id: number | undefined };
  const p = params as { id: number | undefined };
  const id = Number(p.id);
  return {
    //@ts-ignore
    user_id: isNaN(id) ? undefined : id,
    sub_type: query.sub_type ?? 'author_users',
    ordering: query.ordering ?? '-id',
  } satisfies QueryParams;
};

export const getFollowersPaginatedListQueryParams = ({
  searchParams,
  params,
  defaultSubType,
}: {
  defaultSubType: SubContentType;
} & NextPageParams<{ id: string }>) => {
  //@ts-ignore
  const query = searchParams as Omit<FollowersQueryParams, 'id'>;
  const { id } = params;
  const numId = Number(id);
  const isValid = followersOrdering.reduce(
    (isVal, option) => isVal || option.value === (query.ordering ?? '-id'),
    false
  );
  return {
    //@ts-ignore
    id: Number.isNaN(numId) ? undefined : numId,
    sub_type: query.sub_type ?? defaultSubType,
    ordering: isValid ? (query.ordering ?? '-id') : '-id',
  } as FollowersQueryParams;
};
