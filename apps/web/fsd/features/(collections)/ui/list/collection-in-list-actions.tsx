'use client';
import { lazy, Suspense } from 'react';

import { CollectionAbilityActions } from '~entities/collection/model/ability';
import { LikeAction } from '~features/(collections)/ui/like-action';
import { CollectionSchema } from '~shared/api/models/collectionSchema';
import { useSession } from '~shared/lib/session/use-session';

const RemoveCollectionInList = lazy(
  /* webpackChunkName: "RemoveCollectionInList" */ () =>
    import('~features/(collections)/ui/list/remove-action').then((v) => ({
      default: v.RemoveCollectionInList,
    }))
);
export const CollectionInListActions = ({ collection }: { collection: CollectionSchema }) => {
  const sessionId = useSession((v) => v?.id);
  return (
    <div className="flex w-full flex-row justify-between">
      {CollectionAbilityActions.tryLike() && <LikeAction data={collection} />}
      {CollectionAbilityActions.remove({
        //todo fix swager! separate detail and list schemas
        bySessionProps: { ownerId: collection?.user?.id, sessionId },
      }) && (
        <Suspense fallback={null}>
          <RemoveCollectionInList collectionId={collection.id} />
        </Suspense>
      )}
    </div>
  );
};
