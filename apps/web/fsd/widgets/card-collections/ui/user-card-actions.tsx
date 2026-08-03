import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ComponentProps, FC } from 'react';

import { v2ActivityVoteCreateMutation } from '@re/api/generated/@tanstack/react-query.gen';
import type { CardCollection } from '@re/api/generated/types.gen';
import Edit from '@re/ui-kit/icons/edit';
import Like from '@re/ui-kit/icons/like';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { useMutation } from '@tanstack/react-query';

import { usePaginatedUserCardCollections } from '~entities/card-collections/model/utils';
import { client } from '~shared/api/client';
import { RatedStatus } from '~shared/api/models/common';
import { LikeDislikeType } from '~shared/api/models/post';
import { Routing } from '~shared/config/routing';
import { resolveUnknownError } from '~shared/lib/form/error-handling';
import { getInitialState, likeDislikeReducer } from '~shared/lib/like-dislike/model/store';
import {
  VoteActionsLikeBase,
  VoteActionsLikeDislikeRoot,
  VoteActionsProviders,
} from '~shared/lib/like-dislike/ui/actions';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';
import { cn } from '~shared/utils/cn';

interface UserCardVoteActionProps extends ButtonProps {
  model: { score?: number; rated?: number | null | RatedStatus; id: number };
  userId: number;
}

const UserCardVoteAction: FC<UserCardVoteActionProps> = ({
  model,
  disabled,
  className,
  userId,
  ...props
}) => {
  const modelWithDefaults = { ...model, score: model.score ?? 0, rated: model.rated ?? null };
  const paginationListMutator = usePaginatedUserCardCollections({ collectionId: model.id, userId });

  const onSuccess = async () => {
    paginationListMutator((card) => {
      const curState = getInitialState(card.rated ?? null, card.score ?? 0);
      const newState = likeDislikeReducer(curState, { type: LikeDislikeType.LIKE });

      return {
        score: newState.score,
        rated: newState.liked ? RatedStatus.LIKED : newState.disliked ? RatedStatus.DISLIKED : null,
      };
    }, 'mutate');
  };

  const { mutateAsync, isPending } = useMutation({
    ...v2ActivityVoteCreateMutation({ client }),
    onSuccess,
  });

  const onLike = async () => {
    const toast = await importToastAsync();

    try {
      await mutateAsync({
        body: {
          type: 'card_collection',
          data: { target: model.id, vote_type: LikeDislikeType.LIKE },
        },
      });
    } catch (e: unknown) {
      await resolveUnknownError(toast);
      logger.error(e);
    }
  };

  return (
    <VoteActionsLikeDislikeRoot data={modelWithDefaults}>
      <VoteActionsProviders value={{ onLike }}>
        <VoteActionsLikeBase>
          {({ score, liked, onLike }) => (
            <Button
              className={cn(
                'inline-flex items-center gap-2 border px-4 transition-colors duration-300',
                className
              )}
              variant="muted"
              color="muted"
              {...props}
              disabled={disabled || isPending}
              onClick={onLike}
            >
              <Like
                className={cn(
                  { 'fill-current text-red-700': liked },
                  'size-5 transition-colors duration-300'
                )}
              />
              <ReText size="md" weight="semibold">
                {score}
              </ReText>
            </Button>
          )}
        </VoteActionsLikeBase>
      </VoteActionsProviders>
    </VoteActionsLikeDislikeRoot>
  );
};

export const UserCardActions = ({
  collection,
  className,
  ...props
}: { collection: CardCollection } & ComponentProps<'div'>) => {
  const params = useParams<{ id: string }>();
  const userId = Number(params.id);
  const collectionId = collection.id;
  const session = useSession();
  const canEdit = userId === session?.id || !!session?.is_staff;

  if (!canEdit) return null;

  return (
    <div {...props} className={cn('flex items-center gap-4', className)}>
      <UserCardVoteAction userId={userId} model={collection} />

      <Button variant="muted" circle asChild>
        <Link
          href={Routing.ManageCardCollections.edit({
            params: { collection_id: collectionId },
          })}
        >
          <Edit />
        </Link>
      </Button>
    </div>
  );
};
