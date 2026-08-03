import Link from 'next/link';

import Settings from '@re/ui-kit/icons/settings';
import { Button } from '@re/ui-kit/ui/button';

import { CollectionAbilityActions } from '~entities/collection/model/ability';
import { LikeAction } from '~features/(collections)/ui/like-action';
import { RemoveCollectionCurrentRetrieve } from '~features/(collections)/ui/retrieve/remove-action';
import { ShareButton } from '~features/(collections)/ui/share/share';
import { CollectionSchema } from '~shared/api/models/collectionSchema';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';

export const CollectionRetrieveActions = ({
  collection,
}: {
  collection: CollectionSchema | undefined;
}) => {
  const { user, id = -1 } = collection ?? {};
  const sessionId = useSession((v) => v?.id);

  return (
    <>
      {CollectionAbilityActions.tryLike() && <LikeAction data={collection!} />}
      {CollectionAbilityActions.share() && <ShareButton collection={collection!} />}
      {!!collection &&
        CollectionAbilityActions.edit({ bySessionProps: { ownerId: user?.id, sessionId } }) && (
          <Button circle size="sm" asChild variant="outline">
            <Link prefetch={false} href={Routing.Collection.update({ params: { id } })}>
              <Settings size={20} />
            </Link>
          </Button>
        )}
      {!!collection &&
        CollectionAbilityActions.remove({ bySessionProps: { ownerId: user?.id, sessionId } }) && (
          <RemoveCollectionCurrentRetrieve />
        )}
    </>
  );
};
