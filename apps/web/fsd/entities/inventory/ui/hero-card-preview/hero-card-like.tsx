import { ComponentProps, useCallback, useMemo } from 'react';

import { RemangaError } from '@re/core/lib/logger';
import Like from '@re/ui-kit/icons/like';
import { Button, ButtonProps } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { client } from '~shared/api/client';
import {
  inventoryCardsRetrieveOptions,
  v2ActivityVoteCreateMutation,
} from '~shared/api/generated/tanstack';
import { LikeDislikeType, RatedStatus } from '~shared/api/models/post';
import { createQueryInfiniteGeneratedWithClient } from '~shared/api/queries-code-gen-with-client';
import { resolveUnknownError } from '~shared/lib/form/error-handling';
import { getInitialState, likeDislikeReducer } from '~shared/lib/like-dislike/model/store';
import {
  VoteActionsLike,
  VoteActionsLikeBase,
  VoteActionsLikeDislikeRoot,
  VoteActionsProviders,
} from '~shared/lib/like-dislike/ui/actions';
import { logger } from '~shared/lib/logger';
import { ContentSuspenseQuery } from '~shared/lib/react-query/content-suspense-query';
import { QuerySuspenseContainer } from '~shared/lib/react-query/query-suspense-container';

interface LikeHeroCardProps extends ComponentProps<typeof VoteActionsLike> {
  initialData: { rated?: number; id: number; score?: number };
}
const fallbackRenderer = () => null;
const getCardByIdOptions = createQueryInfiniteGeneratedWithClient(inventoryCardsRetrieveOptions);
const hasRequiredData = (
  data: LikeHeroCardProps['initialData']
): data is Required<LikeHeroCardProps['initialData']> => {
  return 'rated' in data && 'score' in data;
};

const processCardWithDefaults = <T extends { rated?: number | RatedStatus | null; score?: number }>(
  card: T
) => {
  return { ...card, rated: card.rated ?? null, score: card.score ?? 0 };
};
interface LikeHeroButtonProps
  extends Omit<ComponentProps<typeof VoteActionsLikeBase>, 'children'>,
    Omit<ButtonProps, 'children'> {}
export const LikeHeroLikeButtonBase = ({
  className,
  score,
  onClick,
  disabled,
  liked,
  ...props
}: { liked?: boolean; score: number | string } & LikeHeroButtonProps) => {
  return (
    <Button
      className={cn(
        'inline-flex items-center gap-2 border px-4 transition-colors duration-300',
        className
      )}
      variant="muted"
      color="muted"
      // size="lg"
      {...props}
      disabled={disabled}
      onClick={onClick}
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
  );
};
const LikeHeroButton = ({ className, disabled, ...props }: LikeHeroButtonProps) => {
  return (
    <VoteActionsLikeBase {...props}>
      {({ score, liked, onLike }) => {
        return (
          <LikeHeroLikeButtonBase
            className={className}
            score={score}
            disabled={disabled}
            liked={liked}
            onClick={onLike}
          />
        );
      }}
    </VoteActionsLikeBase>
  );
};
const LikeButtonCompound = ({
  data,
  onLike,
  disabled,
  ...props
}: ComponentProps<typeof LikeHeroButton> & { onLike?: () => void } & {
  data: { rated: number | null | RatedStatus; score: number };
}) => {
  return (
    <VoteActionsLikeDislikeRoot data={data}>
      <VoteActionsProviders value={{ onLike }}>
        <LikeHeroButton disabled={disabled} {...props} />
      </VoteActionsProviders>
    </VoteActionsLikeDislikeRoot>
  );
};
/**
 * requests card/id every time
 * **/
export const LikeHeroCard = ({ initialData, ...props }: LikeHeroCardProps) => {
  const processedCard = processCardWithDefaults(initialData);
  const { id } = initialData;

  const queryOptions = useMemo(
    () => getCardByIdOptions({ api: { path: { id } }, suspense: true }),
    [id]
  );
  const queryKey = queryOptions.queryKey;
  const queryClient = useQueryClient();
  const onSuccess = useCallback(() => {
    queryClient.setQueryData(queryKey, (card) => {
      if (!card) return card;
      const processedCard = processCardWithDefaults(card);

      const hasRequired = hasRequiredData(processedCard);
      if (!hasRequired) {
        logger.error(new RemangaError(`в card/${id} нет обнаружен rated и score`), {
          score: ['local'],
        });
        return processedCard;
      }
      const curState = getInitialState(processedCard.rated, processedCard.score);
      const newState = likeDislikeReducer(curState, { type: LikeDislikeType.LIKE });
      const cardState = {
        score: newState.score,
        rated: (newState.liked
          ? RatedStatus.LIKED
          : newState.disliked
            ? RatedStatus.DISLIKED
            : null) as number | undefined,
      } as const;
      return {
        ...card,
        ...cardState,
      };
    });
  }, [id, queryClient, queryKey]);
  const mutationLikeOptions = v2ActivityVoteCreateMutation({ client, throwOnError: true });

  const mutationOptions = useMemo(
    () => ({
      ...mutationLikeOptions,
      onSuccess,
    }),
    [onSuccess]
  );
  const { mutateAsync, isPending } = useMutation(mutationOptions);
  const onLike = useCallback(async () => {
    try {
      await mutateAsync({
        body: { type: 'card', data: { target: id, vote_type: LikeDislikeType.LIKE } },
      });
    } catch (e: unknown) {
      logger.error(e);
      await resolveUnknownError();
    }
  }, [id, mutateAsync]);
  const onError = useCallback((e: unknown) => {
    logger.error(e, { scope: ['locale'] });
  }, []);

  return (
    <QuerySuspenseContainer
      fallback={<LikeButtonCompound data={processedCard} disabled onLike={onLike} />}
      onError={onError}
      fallbackRender={fallbackRenderer}
    >
      <ContentSuspenseQuery queryOptions={queryOptions}>
        {({ data: card }) => {
          const processedData = processCardWithDefaults(card);
          const disabled = isPending || !!props?.disabled;
          return (
            <LikeButtonCompound
              data={processedData}
              onLike={onLike}
              {...props}
              disabled={disabled}
            />
          );
        }}
      </ContentSuspenseQuery>
    </QuerySuspenseContainer>
  );
};
