import {v2UsersHistoryListInfiniteOptions,} from '@re/api/generated/@tanstack/react-query.gen';
import {keepPreviousData, skipToken, useQuery} from '@tanstack/react-query';

import {UserKeys} from '~entities/user/model/query-keys';
import {UserRepository} from '~entities/user/model/repository';
import type {EndpointMeta} from '~shared/api/api-toolkit';
import {FormsTypes} from '~shared/api/models/forms';
import type {
    UserRequestListQuerySchema,
    UserRequestListResponseSchema,
    UserRequestParamsSchema,
    UserRequestResponseSchema,
} from '~shared/api/models/panel';
import {
    CardOwnersPaginatedListParamsSchema,
    CardOwnersPaginatedListQuerySchema,
    CardOwnersPaginatedListResponseSchema,
    DetailedUserParamsSchema,
    DetailedUserQuerySchema,
    DetailedUserResponseSchema,
    OwnersByBadgeIdParamsSchema,
    OwnersByBadgeIdQuerySchema,
    OwnersByBadgeIdResponseSchema,
    UserAchievementsPaginatedListParamsSchema,
    UserAchievementsPaginatedListQuerySchema,
    UserAchievementsPaginatedListResponseSchema,
    UserBadgeByIdParamsSchema,
    UserBadgeByIdQuerySchema,
    UserBadgeByIdResponseSchema,
    UserBadgesPaginatedListParamsSchema,
    UserBadgesPaginatedListQuerySchema,
    UserBadgesPaginatedListResponseSchema,
    UserBookmarksPaginatedListParamsSchema,
    UserBookmarksPaginatedListQuerySchema,
    UserBookmarksPaginatedListResponseSchema,
    UserBookmarksTypesPaginatedListParamsSchema,
    UserBookmarksTypesPaginatedListQuerySchema,
    UserBookmarksTypesPaginatedListResponseSchema,
    UserDetailResponseSchema,
    UserHistoryPaginatedListParamsSchema,
    UserHistoryPaginatedListQuerySchema,
    UserHistoryPaginatedListResponseSchema,
} from '~shared/api/models/user';
import {createQueryInfiniteGeneratedWithClient} from '~shared/api/queries-code-gen-with-client';
import {customSkipToken, queryKit} from '~shared/api/react-query';
import {defaultNextParam} from '~shared/lib/react-query/default-next-param';
import {getTypesBaseKey} from '~shared/lib/use-types-base';

export const {useQuery: useUserBookmarksTypes, getKey: getUserBookmarksTypesKey} =
    queryKit.createQuery<
        EndpointMeta<
            UserBookmarksTypesPaginatedListParamsSchema,
            UserBookmarksTypesPaginatedListQuerySchema
        >,
        UserBookmarksTypesPaginatedListResponseSchema
    >(
        ({variables, fetchOptions}) => ({
            queryKey: UserKeys.bookmarksTypesByUserId(variables),
            queryFn: () => UserRepository.bookmarksTypesByUserId(variables, fetchOptions),
        }),
        true
    );

export const {useQuery: useUserBookmarksTypesSuspense, getKey: getUserBookmarksTypesSuspenseKey} =
    queryKit.createSuspenseQuery<
        EndpointMeta<
            UserBookmarksTypesPaginatedListParamsSchema,
            UserBookmarksTypesPaginatedListQuerySchema
        >,
        UserBookmarksTypesPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.bookmarksTypesByUserId(variables),
        queryFn: () => UserRepository.bookmarksTypesByUserId(variables, fetchOptions),
    }));

export const {getKey: getUserAchievementsQuery, useQuery: useUserAchievements} =
    queryKit.createSuspenseInfiniteQuery<
        EndpointMeta<
            UserAchievementsPaginatedListParamsSchema,
            UserAchievementsPaginatedListQuerySchema
        >,
        UserAchievementsPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.achievementsUserId(variables),
        staleTime: Infinity,
        getNextPageParam: defaultNextParam,
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.achievementsById(
                {
                    ...variables,
                    query: {...variables.query, page: pageParam},
                },
                fetchOptions
            ),
    }));

export const {getKey: getUserBadgesKey, useQuery: useUserBadges} =
    queryKit.createSuspenseInfiniteQuery<
        EndpointMeta<UserBadgesPaginatedListParamsSchema, UserBadgesPaginatedListQuerySchema>,
        UserBadgesPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.badgesUserId(variables),
        staleTime: Infinity,
        getNextPageParam: defaultNextParam,
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.badgesById(
                {
                    ...variables,
                    query: {...variables.query, page: pageParam},
                },
                fetchOptions
            ),
    }));
export const {getKey: getBadgeByIdKey, useQuery: useBadgeById} = queryKit.createSuspenseQuery<
    EndpointMeta<UserBadgeByIdParamsSchema, UserBadgeByIdQuerySchema>,
    UserBadgeByIdResponseSchema
>(({variables, fetchOptions}) => ({
    queryKey: UserKeys.badgeById(variables),
    staleTime: Infinity,
    queryFn: () =>
        UserRepository.badgeById(
            {
                ...variables,
                query: {...variables.query},
            },
            fetchOptions
        ),
}));
export const {getKey: getOwnersByBadgeIdKey, useQuery: useOwnersByBadgeId} =
    queryKit.createInfiniteQuery<
        EndpointMeta<OwnersByBadgeIdParamsSchema, OwnersByBadgeIdQuerySchema>,
        OwnersByBadgeIdResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.ownersByBadgeId(variables),
        staleTime: Infinity,
        getNextPageParam: defaultNextParam,
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.ownersByBadgeId(
                {
                    ...variables,
                    query: {...variables.query, page: pageParam},
                },
                fetchOptions
            ),
    }));
type UserFormType = Pick<Parameters<typeof getTypesBaseKey<FormsTypes.USERS>>[0], 'get'>;
export const getUserFormsKey = ({get}: UserFormType) =>
    getTypesBaseKey({
        type: FormsTypes.USERS,
        get,
    });

export const useUserForms = ({get}: UserFormType) => useQuery(getUserFormsKey({get}));
export const {useQuery: useUserQuery, getKey: getUserQueryKey} = queryKit.createQuery<
    EndpointMeta<DetailedUserParamsSchema, DetailedUserQuerySchema>,
    DetailedUserResponseSchema
>(({variables, fetchOptions}) => ({
    queryKey: UserKeys.detailById(variables),
    // enabled:!!variables.params?.userId,
    queryFn: !variables.params?.userId
        ? skipToken
        : () => UserRepository.userById(variables, fetchOptions),
}));
export const {useQuery: useUserSuspenseQuery, getKey: getSuspenseUserQuery} =
    queryKit.createSuspenseQuery<
        EndpointMeta<DetailedUserParamsSchema, DetailedUserQuerySchema>,
        DetailedUserResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.detailById(variables),
        // enabled:!!variables.params?.userId,
        // @ts-ignore
        queryFn: !variables.params?.userId
            ? (customSkipToken as unknown as () => Promise<UserDetailResponseSchema>)
            : () => UserRepository.userById(variables, fetchOptions),
    }));
export const {useQuery: useUserBookmarks, getKey: getUserBookmarksQuery} =
    queryKit.createInfiniteQuery<
        EndpointMeta<UserBookmarksPaginatedListParamsSchema, UserBookmarksPaginatedListQuerySchema>,
        UserBookmarksPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.bookmarksByUserId(variables),
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.bookmarksByUserId(
                {
                    ...variables,
                    query: {
                        ...variables.query,
                        page: pageParam,
                    },
                },
                fetchOptions
            ),
        placeholderData: keepPreviousData,
        getNextPageParam: defaultNextParam,
        staleTime: Infinity,
    }));

export const {useQuery: useUserHistory, getKey: getUserHistoryQuery} =
    queryKit.createInfiniteQuery<
        EndpointMeta<UserHistoryPaginatedListParamsSchema, UserHistoryPaginatedListQuerySchema>,
        UserHistoryPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.historyByUserId(variables),
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.historyByUserId(
                {
                    ...variables,
                    query: {
                        ...variables.query,
                        count: variables.query?.count || 20,
                        page: pageParam,
                    },
                },
                fetchOptions
            ),
        getNextPageParam: defaultNextParam,
        placeholderData: keepPreviousData,
        staleTime: Infinity,
    }));

export const {useQuery: useCardOwnersInfiniteByCardId, getKey: getCardOwnersInfinityQuery} =
    queryKit.createInfiniteQuery<
        EndpointMeta<CardOwnersPaginatedListParamsSchema, CardOwnersPaginatedListQuerySchema>,
        CardOwnersPaginatedListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.cardOwnersByCardId(variables),
        staleTime: Infinity,
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.cardOwnersByCardId(
                {
                    ...variables,
                    query: {...variables.query, page: pageParam},
                },
                fetchOptions
            ),
        placeholderData: keepPreviousData,
        getNextPageParam: defaultNextParam,
    }));

export const {useQuery: useUserRequestList, getKey: getUserRequestList} =
    queryKit.createInfiniteQuery<
        EndpointMeta<void, UserRequestListQuerySchema>,
        UserRequestListResponseSchema
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.requestList(variables),
        staleTime: Infinity,
        initialPageParam: variables.query?.page ?? 1,
        queryFn: ({pageParam}) =>
            UserRepository.requestList(
                {
                    ...variables,
                    query: {
                        ...variables.query,
                        page: pageParam,
                    },
                },
                fetchOptions
            ),
        placeholderData: keepPreviousData,
        getNextPageParam: defaultNextParam,
    }));

export const {useQuery: useUserRequest, getKey: getUserRequest} = queryKit.createSuspenseQuery<
    EndpointMeta<UserRequestParamsSchema, void>,
    UserRequestResponseSchema
>(({variables, fetchOptions}) => ({
    queryKey: UserKeys.requestItem(variables),
    queryFn: () => UserRepository.requestItemById(variables, fetchOptions),
}));

export const {useQuery: useLastUserRequest, getKey: getLastUserRequest} =
    queryKit.createSuspenseQuery<
        EndpointMeta<void, UserRequestListQuerySchema>,
        UserRequestResponseSchema | null
    >(({variables, fetchOptions}) => ({
        queryKey: UserKeys.requestItem({}),
        queryFn: async () => {
            const requestList = await UserRepository.requestList({
                query: {
                    ...variables.query,
                    page: 1,
                },
            });
            const lastRequestListItem = requestList.results[0];

            if (!lastRequestListItem) return null;

            return await UserRepository.requestItemById(
                {
                    params: {
                        requestId: lastRequestListItem.id,
                    },
                },
                fetchOptions
            );
        },
    }));

export const reV2UsersHistoryListInfiniteOptions = createQueryInfiniteGeneratedWithClient(
    v2UsersHistoryListInfiniteOptions
);
