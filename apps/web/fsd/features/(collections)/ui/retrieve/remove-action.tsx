'use client';
import { useParams, useRouter } from 'next/navigation';

import { RemoveCollection } from '~entities/collection/ui/actions';
import { Routing } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';

const useSuccessRemoveCollection = () => {
  const router = useRouter();
  const sessionId = useSession((v) => v?.id);
  return () => router.push(Routing.Collection.list({ query: { user_id: sessionId } }));
};
export const RemoveCollectionCurrentRetrieve = () => {
  const { id } = useParams() as { id: string };
  const onSuccess = useSuccessRemoveCollection();

  return <RemoveCollection onSuccess={onSuccess} collectionId={Number(id)} />;
};
