import type { DefaultError, MutationOptions } from '@tanstack/query-core';

import { useOptimisticMutation } from '~shared/api/react-query';

import { ChatQueryKeys } from '../toolkit/query-key';
import { ChatRepository } from '../toolkit/repository';
import { ChannelSchema, ChannelType } from '../types';
import {
  type ChangeChannelRequestSchema,
  type ChangeChannelResponseSchema,
  type ChannelManipBaseRequestSchema,
  type CreateChannelRequestSchema,
  type CreateChannelResponseSchema,
  type GetOrCreateChatWithUserParamsSchema,
  type RemoveMemberRequestSchema,
  type UpdateMemberRequestSchema,
  type UpdateMemberResponseSchema,
} from './types';

/**
 * Hook for creating a new channel
 * @param channelId The channel directory
 */
export const useCreateChannelMutation = (
  options: MutationOptions<
    CreateChannelResponseSchema,
    DefaultError,
    CreateChannelRequestSchema & { cover: string | File }
  >
) =>
  useOptimisticMutation<
    CreateChannelResponseSchema,
    DefaultError,
    CreateChannelRequestSchema & { cover: string | File }
  >({
    ...options,
    invalidate: [ChatQueryKeys.Channel.List.get({ query: {} })],
    mutationKey: ['on-create', 'channel'],
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append('type', ChannelType.GROUP);
      formData.append('member_ids', data.member_ids?.join(',') ?? '');
      formData.append('name', data.name ?? '');
      if (data.cover) {
        formData.append('cover', data.cover);
      }

      const response = await ChatRepository.Channel.create({
        data: formData as unknown as CreateChannelRequestSchema,
      });

      if (!response) {
        throw new Error('Не удалось создать беседу');
      }

      return response;
    },
  });

/**
 * Hook for updating a channel
 * @param channelId The channel directory
 */
export const useUpdateChannelMutation = (
  channelId: number,
  options: MutationOptions<ChangeChannelResponseSchema, DefaultError, ChangeChannelRequestSchema>
) =>
  useOptimisticMutation<ChangeChannelResponseSchema, DefaultError, ChangeChannelRequestSchema>({
    ...options,
    invalidate: [
      ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
      ChatQueryKeys.Channel.List.get({ query: {} }),
    ],
    mutationKey: ['on-manage', 'channel', { params: { channelId } }],
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append('name', data.name ?? '');
      if (data.cover) {
        formData.append('cover', data.cover);
      }

      const response = await ChatRepository.Channel.change({
        params: { channelId },
        data: formData as unknown as ChangeChannelRequestSchema,
      });

      if (!response) {
        throw new Error('Не удалось создать беседу');
      }

      return response;
    },
  });

/**
 * Hook for updating a channel
 * @param channelId The channel directory
 */
export const useDeleteChannelMutation = (
  channelId: number,
  options: MutationOptions<void, DefaultError, void>
) =>
  useOptimisticMutation<void, DefaultError, void>({
    ...options,
    invalidate: [
      ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
      ChatQueryKeys.Channel.List.get({ query: {} }),
    ],
    mutationKey: ['on-manage', 'channel', { params: { channelId } }],
    mutationFn: () =>
      ChatRepository.Channel.remove({
        params: { channelId },
      }),
  });

/**
 * Hook for leaving a channel
 * @param channelId The channel directory
 */
export const useLeaveChannelMutation = (
  channelId: number,
  options: MutationOptions<void, DefaultError, void>
) =>
  useOptimisticMutation<void, DefaultError, void>({
    ...options,
    mutationKey: ['on-manage', 'channel', { params: { channelId } }],
    invalidate: [
      ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
      ChatQueryKeys.Channel.List.get({ query: {} }),
    ],
    mutationFn: () =>
      ChatRepository.Channel.leave({
        params: { channelId },
      }),
  });

/**
 * Hook for changing a channel member's properties
 * @param channelId The channel directory
 */
export const useChangeChannelMemberMutation = (channelId: number) =>
  useOptimisticMutation<UpdateMemberResponseSchema, DefaultError, UpdateMemberRequestSchema>({
    invalidate: ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
    mutationKey: ['on-change', 'channel-member', { params: { channelId } }],
    mutationFn: (data) =>
      ChatRepository.Member.change({
        params: { channelId },
        data,
      }),
  });

/**
 * Hook for inviting a member to a channel
 * Multiple invite functionality may be added in the future with different schemas
 * @param channelId The channel ID
 */
export const useInviteChannelMemberMutation = (
  channelId: number,
  options?: MutationOptions<UpdateMemberResponseSchema, DefaultError, UpdateMemberRequestSchema>
) =>
  useOptimisticMutation<UpdateMemberResponseSchema, DefaultError, UpdateMemberRequestSchema>({
    ...options,
    mutationKey: ['on-create', 'channel-member', { params: { channelId } }],
    invalidate: ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
    mutationFn: (data) =>
      ChatRepository.Member.invite({
        params: { channelId },
        data,
      }),
  });

/**
 * Hook for removing a member from a channel
 * @param channelId The channel ID
 */
export const useRemoveChannelMemberMutation = (
  channelId: number,
  options: MutationOptions<void, DefaultError, RemoveMemberRequestSchema>
) =>
  useOptimisticMutation<void, DefaultError, RemoveMemberRequestSchema>({
    ...options,
    mutationFn: (data) =>
      ChatRepository.Member.remove({
        params: { channelId },
        data,
      }),
    invalidate: ChatQueryKeys.Channel.ById.get({ params: { channelId } }),
    mutationKey: ['on-remove', 'channel-member', { params: { channelId } }],
  });

export type useGetOrCreateChatWithUserMutationOptions = MutationOptions<
  ChannelSchema,
  DefaultError,
  GetOrCreateChatWithUserParamsSchema
>;

/**
 * Hook for getting or creating a chat with a specific user
 * @param userId The ID of the user to chat with
 */
export const useGetOrCreateChatWithUserMutation = (
  options: useGetOrCreateChatWithUserMutationOptions
) =>
  useOptimisticMutation<ChannelSchema, DefaultError, GetOrCreateChatWithUserParamsSchema>({
    ...options,
    mutationKey: ['on-get-or-create', 'chat-with-user'],
    invalidate: [ChatQueryKeys.Channel.List.get({ query: {} })],
    mutationFn: async (params) => {
      const channel = await ChatRepository.Channel.getPrivateChatWithUser({
        params: { userId: params.userId },
      }).catch(() => {});

      if (!channel) {
        const formData = new FormData();

        // Добавляем данные в FormData
        formData.append('type', ChannelType.PRIVATE);
        formData.append('member_ids', [params.userId].join(','));

        const newChannel = await ChatRepository.Channel.create({
          data: formData as unknown as ChannelManipBaseRequestSchema,
        });

        return newChannel;
      }
      return channel;
    },
  });
