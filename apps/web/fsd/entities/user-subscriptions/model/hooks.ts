'use client';
import { useParams, useSearchParams } from 'next/navigation';

import {
  getFollowersPaginatedListQueryParams,
  getSubscriptionsPaginatedListQueryParams,
} from '~entities/user-subscriptions/model/utils/getParams';
import type {
  SubContentType,
  UserSubscriptionsPaginatedListQuerySchema,
} from '~shared/api/models/user-subscriptions';

type QueryParams = Pick<UserSubscriptionsPaginatedListQuerySchema, 'sub_type' | 'ordering'> & {
  user_id: number;
};

export const useSubscriptionsPaginatedListQueryParams = (): QueryParams => {
  const params = useParams();
  const searchParams = useSearchParams();
  const objectSearchParams = {} as Record<string, string | string[] | undefined>;
  searchParams.forEach((val, key) => {
    objectSearchParams[key] = val;
  });
  //@ts-ignore
  return getSubscriptionsPaginatedListQueryParams(params, objectSearchParams);
};

export const useFollowersPaginatedListQueryParams = (
  defaultSubType: SubContentType,
  entityId: number
) => {
  const searchParams = useSearchParams();
  const objectSearchParams = {} as Record<string, string | string[] | undefined>;
  searchParams.forEach((val, key) => {
    objectSearchParams[key] = val;
  });
  return getFollowersPaginatedListQueryParams({
    searchParams: objectSearchParams,
    defaultSubType,
    params: { id: String(entityId) },
  });
};

export const useUserFollowersPaginatedListQueryParams = (defaultSubType: SubContentType) => {
  const searchParams = useSearchParams();
  const params = useParams();
  const objectSearchParams = {} as Record<string, string | string[] | undefined>;
  searchParams.forEach((val, key) => {
    objectSearchParams[key] = val;
  });
  //todo смысл пиздопляски в том, чтобы дать понять, что если выполнился на сервере getFollowerParams - там должна быть проверка, ну или должен быть внутренний кетч, то тут точно всё ок с {id:number}
  return getFollowersPaginatedListQueryParams({
    searchParams: objectSearchParams,
    defaultSubType,
    params,
  });
};
