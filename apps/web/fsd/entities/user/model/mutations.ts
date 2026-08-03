import { DefaultError } from '@tanstack/query-core';
import { useMutation } from '@tanstack/react-query';

import { v2UsersCurrentRetrieveQueryKey } from '@re/api/generated/@tanstack/react-query.gen';

import { UserKeys } from '~entities/user/model/query-keys';
import { AuthRepository, UserRepository } from '~entities/user/model/repository';
import type { EndpointMeta, ToolkitMethod } from '~shared/api/api-toolkit';
import type { UserRequestParamsSchema } from '~shared/api/models/panel';
import type {
  ChangeNotifyBookmarksUserRequestSchema,
  ChangePushNotifyBookmarksUserRequestSchema,
  CreateUserBookmarkRequestSchema,
  DeleteUserBookmarkRequestSchema,
  DeleteUserHistoryParamsSchema,
  DeleteUserHistoryQuerySchema,
  DeleteUserHistoryRequestSchema,
  DeleteUserHistoryResponseSchema,
  DetailedCurrentUserSchema,
  DetailedUserParamsSchema,
  DetailedUserQuerySchema,
  DetailedUserSchema,
  MoveBookmarksUserRequestSchema,
  TransferBookmarksUserRequestSchema,
  UpdateCurrentUserRequestSchema,
  UpdateUserBookmarkRequestSchema,
  UpdateUserEmailRequestSchema,
  UpdateUserEmailResponseSchema,
  UserChangePublisherOrderRequestSchema,
} from '~shared/api/models/user';
import type { OptimisticMutationOptions } from '~shared/api/react-query';
import {
  getQueryClient,
  mergeInvalidates,
  queryClient,
  useOptimisticMutation,
} from '~shared/api/react-query';
import { useSession } from '~shared/lib/session/use-session';

export const useChangePassword = () =>
  useOptimisticMutation<
    AuthRepository.ChangePasswordResponseSchema,
    DefaultError,
    AuthRepository.ChangePasswordRequestSchema
  >({
    mutationFn: (data) => AuthRepository.changePassword(data),
  });

export const useLogin = () =>
  useOptimisticMutation<
    AuthRepository.LoginResponseSchema,
    DefaultError,
    AuthRepository.LoginRequestSchema
  >({
    mutationFn: (data) => AuthRepository.login(data),
  });

export const useLoginTwoFactor = () =>
  useMutation<
    AuthRepository.LoginSuccessResponseSchema,
    DefaultError,
    AuthRepository.LoginTwoFactorRequestSchema
  >({
    mutationFn: (data) => AuthRepository.loginTwoFactor(data),
  });

export const usePasswordRecovery = () =>
  useMutation<
    AuthRepository.LoginSuccessResponseSchema,
    DefaultError,
    AuthRepository.PasswordRecoveryRequestSchema
  >({
    mutationFn: (data) => AuthRepository.resetPassword(data),
  });

export const useRegister = () =>
  useMutation<
    AuthRepository.RegisterResponseSchema,
    DefaultError,
    AuthRepository.RegisterRequestSchema
  >({
    mutationFn: (data) => AuthRepository.register(data),
  });

export const useSendPasswordRecoveryEmail = () =>
  useMutation<
    V1Response<DetailedCurrentUserSchema>,
    DefaultError,
    AuthRepository.SendPasswordRecoveryEmailRequestSchema
  >({
    mutationFn: (data) => AuthRepository.sendPasswordRecoveryEmail(data),
  });

export const useSendTwoFactorCodeEmail = () =>
  useOptimisticMutation({
    mutationFn: AuthRepository.sendTwoFactorCodeEmail,
  });

export const useUpdateCurrentUser = (
  options?: OptimisticMutationOptions<
    V1Response<DetailedCurrentUserSchema>,
    DefaultError,
    UpdateCurrentUserRequestSchema
  >
) => {
  const session = useSession()!;

  return useOptimisticMutation<
    V1Response<DetailedCurrentUserSchema>,
    DefaultError,
    UpdateCurrentUserRequestSchema
  >({
    ...options,
    mutationFn: (data) => UserRepository.update({ data }),
    invalidate: mergeInvalidates(
      UserKeys.detailById({ params: { userId: String(session.id) } }),
      options?.invalidate
    ),
  });
};

export const useUpdateEmail = () =>
  useMutation<UpdateUserEmailResponseSchema, DefaultError, UpdateUserEmailRequestSchema>({
    mutationFn: (data) => UserRepository.changeEmail({ data }),
  });

export const useTransferBookmarks = () =>
  useMutation<void, DefaultError, TransferBookmarksUserRequestSchema>({
    mutationFn: (data) => UserRepository.transferBookmarks({ data }),
  });

export const changeSessionParamsLocally = (
  mutator: (user: DetailedCurrentUserSchema) => DetailedCurrentUserSchema
) => {
  queryClient.setQueryData<DetailedCurrentUserSchema, unknown>(
    {
      predicate: ({ queryKey }) =>
        queryKey?.[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]?._id,
    },
    (d) => {
      if (!d) return d;
      return mutator(d);
    }
  );
};
export const changeUserParamsLocally = ({
  variables,
  mutator,
}: {
  mutator: (user: DetailedUserSchema) => DetailedUserSchema;
  variables: EndpointMeta<DetailedUserParamsSchema, DetailedUserQuerySchema>;
}) => {
  getQueryClient().setQueryData(UserKeys.detailById(variables), mutator);
};

export const useDeleteUserHistory = () =>
  useOptimisticMutation<
    DeleteUserHistoryResponseSchema,
    DefaultError,
    ToolkitMethod<
      DeleteUserHistoryRequestSchema,
      DeleteUserHistoryParamsSchema,
      DeleteUserHistoryQuerySchema
    >
  >({
    mutationFn: (variables) => UserRepository.deleteHistoryByUserId(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.historyByUserId({})[0],
  });

export const useMoveBookmarks = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<MoveBookmarksUserRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.moveBookmarks(variables),
    invalidate: ({ queryKey }) =>
      queryKey[0] === UserKeys.bookmarksByUserId({})[0] ||
      queryKey[0] === UserKeys.bookmarksTypesByUserId({})[0],
  });

export const useBookmarksChangeNotify = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<ChangeNotifyBookmarksUserRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.bookmarksChangeNotify(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.bookmarksByUserId({})[0],
  });

export const useBookmarksChangePushNotify = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<ChangePushNotifyBookmarksUserRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.bookmarksChangePushNotify(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.bookmarksByUserId({})[0],
  });

export const useDeleteBookmark = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<DeleteUserBookmarkRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.deleteBookmark(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.bookmarksTypesByUserId({})[0],
  });

export const useCreateBookmark = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<CreateUserBookmarkRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.createBookmark(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.bookmarksTypesByUserId({})[0],
  });

export const useUpdateBookmark = () =>
  useOptimisticMutation<
    void,
    DefaultError,
    ToolkitMethod<UpdateUserBookmarkRequestSchema, any, any>
  >({
    mutationFn: (variables) => UserRepository.updateBookmark(variables),
    invalidate: ({ queryKey }) => queryKey[0] === UserKeys.bookmarksTypesByUserId({})[0],
  });

export const useChangePublisherOrder = () =>
  useOptimisticMutation<void, DefaultError, UserChangePublisherOrderRequestSchema>({
    mutationFn: (data) => UserRepository.changePublisherOrder({ data }),
    invalidate: ({ queryKey }) =>
      queryKey[0]?._id === v2UsersCurrentRetrieveQueryKey({})[0]._id ||
      queryKey[0] === UserKeys.detailById({})[0],
  });

export const useCancelRequest = () =>
  useOptimisticMutation<void, DefaultError, UserRequestParamsSchema>({
    mutationFn: (data) => UserRepository.cancelRequestItemById({ params: data }),
    invalidate: ({ queryKey }) =>
      queryKey[0] === UserKeys.requestItem({})[0] || queryKey[0] === UserKeys.requestList({})[0],
  });
