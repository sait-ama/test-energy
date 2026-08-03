import type { UseMutationOptions } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';

import { useActivityItemContext } from '~entities/activity/model/context';
import { ActivityRepository } from '~entities/activity/model/repository';
import {
  useActivityItemActionsContext,
  useActivityListActionsContext,
} from '~features/activity/model/context';
import type {
  CollectionCommentTarget,
  CommentSchema,
  ForumPostCommentTarget,
  MomentCommentTarget,
  ProfileCommentsTarget,
  ReplyCommentTarget,
  TitleCommentTarget,
} from '~shared/api/models/activity';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const useActivityBanMutation = () => {
  const actions = useActivityListActionsContext();
  const { setState } = useActivityItemActionsContext();
  const { data } = useActivityItemContext();

  return useMutation({
    mutationFn: () => ActivityRepository.ban({ params: { commentId: data.id } }),
    onMutate: async () => {
      setState((state) => ({ ...state, isDeleting: true }));
    },
    onSuccess: () => {
      actions.remove(data.id);
      // actions.invalidate();
    },
    onError: async (error) => {
      const toast = await importToastAsync();

      toast.error(
        Object.entries(error.detail)
          .map((_, value) => value)
          .join(' | ')
      );
      setState((state) => ({ ...state, isDeleting: false }));
    },
  });
};

export const useActivityCreateMutation = () => {
  const actions = useActivityListActionsContext();

  return useMutation({
    mutationFn: async (comment: Partial<CommentSchema>) => {
      const { target } = actions.getParams();

      return ActivityRepository.create({
        data: {
          ...comment,
          ...((target as TitleCommentTarget).title_id
            ? { title: (target as TitleCommentTarget).title_id }
            : {}),
          ...((target as ProfileCommentsTarget).profile_id
            ? { profile: (target as ProfileCommentsTarget).profile_id }
            : {}),
          ...((target as TitleCommentTarget).chapter_id
            ? { chapter: (target as TitleCommentTarget).chapter_id }
            : {}),
          ...((target as TitleCommentTarget).chapter_page
            ? { page: (target as TitleCommentTarget).chapter_page }
            : {}),
          ...((target as ForumPostCommentTarget).post_id
            ? { post: (target as ForumPostCommentTarget).post_id }
            : {}),
          ...((target as CollectionCommentTarget).collection_id
            ? { collection: (target as CollectionCommentTarget).collection_id }
            : {}),
          ...((target as MomentCommentTarget).moment_id
            ? { moment: (target as MomentCommentTarget).moment_id }
            : {}),
        },
      });
    },
    onError: resolveErrorAsync,
    onSuccess: () => {
      actions.add();
    },
  });
};

export const useActivityDeleteMutation = () => {
  const actions = useActivityListActionsContext();
  const { setState } = useActivityItemActionsContext();
  const { data } = useActivityItemContext();

  return useMutation({
    mutationFn: () => ActivityRepository.del({ params: { commentId: data.id } }),
    onMutate: async () => {
      setState((state) => ({ ...state, isDeleting: true }));
    },
    onSuccess: () => {
      actions.remove(data.id);
      // actions.invalidate();
    },
    onError: async (error) => {
      await resolveErrorAsync(error);

      setState((state) => ({ ...state, isDeleting: false }));
    },
  });
};

export const useActivityEditMutation = (params: Partial<UseMutationOptions>) => {
  const actions = useActivityListActionsContext();
  const { setState } = useActivityItemActionsContext();

  return useMutation({
    mutationFn: (comment: Partial<CommentSchema>) =>
      ActivityRepository.edit({
        params: { commentId: comment.id! },
        data: comment,
      }),
    onMutate: async () => {
      if (params.onMutate) params.onMutate();

      setState((state) => ({ ...state, isUpdating: true }));
    },
    onSuccess: (comment) => {
      actions.update(comment.id, comment);
    },
    onError: resolveErrorAsync,
    onSettled: () => {
      setState((state) => ({ ...state, isUpdating: false }));
    },
  });
};

export const useActivityReplyMutation = (
  target: ReplyCommentTarget,
  params: UseMutationOptions<Partial<CommentSchema>>
) => {
  const actions = useActivityListActionsContext();

  return useMutation({
    mutationFn: (comment: Partial<CommentSchema>) =>
      ActivityRepository.reply({
        data: {
          ...comment,
          ...target,
        },
      }),
    onMutate: () => {
      if (params.onMutate) params.onMutate();
    },
    onSuccess: async (...args) => {
      // TODO add !isSublist ?
      await actions.add();
      // @ts-ignore
      if (params.onSuccess) params.onSuccess(...args);
    },
    onError: resolveErrorAsync,
    onSettled: (...args) => {
      // @ts-ignore
      if (params.onSettled) params.onSettled(...args);
    },
  });
};

export const useActivityLikeMutation = (props?: { type?: 0 | 1 }) => {
  const { type = 0 } = props ?? {};
  const actions = useActivityListActionsContext();
  const { data } = useActivityItemContext();

  return useMutation({
    mutationFn: () => ActivityRepository.like({ data: { comment: data.id, type } }),
    mutationKey: ['comment-like-mutation', { type }],
    onMutate: () => {
      const previousData = { rated: data.rated, score: data.score };

      const isLike = type === 0;
      const isDislike = type === 1;

      const getLikeData = () =>
        data.rated === 0
          ? {
              rated: null,
              score: data.score - 1,
            }
          : {
              rated: 0,
              score: data.score + (!data.rated ? 1 : 2),
            };

      const getDislikeData = () =>
        data.rated === 1
          ? {
              rated: null,
              score: data.score + 1,
            }
          : {
              rated: 1,
              score: data.score - (data.rated === 0 ? 2 : 1),
            };

      actions.update(data.id, isLike ? getLikeData() : isDislike ? getDislikeData() : {});

      return {
        previousData,
      };
    },
    onError: (_err, _new, context) => {
      if (context) actions.update(data.id, context.previousData);
    },
  });
};
