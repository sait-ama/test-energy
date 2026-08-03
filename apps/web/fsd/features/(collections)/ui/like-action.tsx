import { useCollectionLikeAction } from '~features/(collections)/model/mutations';
import type { CollectionSchema } from '~shared/api/models/collectionSchema';
import { LikeDislikeType } from '~shared/api/models/post';
import { resolveErrorAsync } from '~shared/lib/form/error-handling';
import {
  VoteActionsLike,
  VoteActionsLikeDislikeRoot,
  VoteActionsProviders,
} from '~shared/lib/like-dislike/ui/actions';
import { logger } from '~shared/lib/logger';
import { useLoggedCheck } from '~shared/lib/session/use-logged';

export type LikeActionCollectionProps = {
  data: CollectionSchema;
};
export const LikeAction = ({ data }: LikeActionCollectionProps) => {
  const { mutateAsync } = useCollectionLikeAction();
  const check = useLoggedCheck();
  const onLike = check(async () => {
    try {
      if (!data) return;
      await mutateAsync({ type: LikeDislikeType.LIKE, collection: data.id });
    } catch (e) {
      logger.error(e);
      await resolveErrorAsync(e);
    }
  });

  return (
    <VoteActionsLikeDislikeRoot data={data ?? {}}>
      <VoteActionsProviders value={{ onLike }}>
        <VoteActionsLike />
      </VoteActionsProviders>
    </VoteActionsLikeDislikeRoot>
  );
};
