import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@re/ui-kit/ui/button';
import { useQuery } from '@tanstack/react-query';

import { CollectionType, getCardRetrieveQueryKey } from '~entities/card-collections/model/queries';
import { RemoveCollectionCards } from '~features/(manage-card-collections)/actions/remove';
import { useUpdateCollectionCards } from '~features/(manage-card-collections)/manage-forms/model/mutations';
import { ManageCardCollectionBottomActionsSlot } from '~features/(manage-card-collections)/manage-forms/ui/bottom-actions/slot';
import {
  SubmitAction,
  SubmitActionProps,
} from '~features/(manage-card-collections)/manage-forms/ui/bottom-actions/submit';
import { InventoryTab } from '~pages/(user)/inventory-tab/model/const';
import { Routing } from '~shared/config/routing';
import { useErrorHandler } from '~shared/lib/form/error-handling';
import { logger } from '~shared/lib/logger';
import { useSession } from '~shared/lib/session/use-session';
import { importToastAsync } from '~shared/ui/toast/toast.async';

export const editCardCollectionTriggerId = 'manage-card-collection-trigger-edit';
const RestoreCollection = () => {
  const user_id = useSession((v) => v?.id)!;
  const params = useParams<{ collection_id: string }>();
  const collection_id = Number(params.collection_id);

  const { data: collection } = useQuery(
    getCardRetrieveQueryKey({
      variables: { params: { collection_id, user_id } },
    })
  );
  const { reset } = useFormContext();
  return (
    <Button onClick={() => reset(collection)} variant="secondary">
      Сбросить
    </Button>
  );
};
export const BottomActions = () => {
  const params = useParams<{ collection_id: string }>();
  const collectionId = Number(params.collection_id);
  const userId = useSession((v) => v?.id)!;
  const { mutateAsync } = useUpdateCollectionCards();

  const [linking, setLinking] = useState(false);
  const router = useRouter();
  const form = useFormContext();
  const resolver = useErrorHandler({ form });
  const onSubmit: SubmitActionProps['compoundOnSubmitHandler'] = useCallback(
    async (values) => {
      setLinking(true);

      try {
        const [toast] = await Promise.all([
          importToastAsync(),

          mutateAsync({
            body: { ...values, position: values?.position || 1 },
            path: {
              collection_id: collectionId,
            },
          }),
        ]);
        toast.success('Коллекция успешно изменена, идёт переадресация');

        router.push(
          Routing.User.detail({
            params: { id: userId!, tab: 'inventory' },
            query: {
              type: InventoryTab.COLLECTIONS,
              collectionCardType: CollectionType.USER,
            },
          })
        );
      } catch (error) {
        setLinking(false);
        await resolver(error);
        logger.error(error);
      }
    },
    [mutateAsync, collectionId, userId]
  );
  useEffect(() => {
    return () => {
      setLinking(false);
    };
  }, []);
  return (
    <ManageCardCollectionBottomActionsSlot>
      <RestoreCollection key="restore" />
      <RemoveCollectionCards
        onError={() => {
          setLinking(false);
        }}
        onSuccess={(toast) => {
          setLinking(true);

          toast.success('Коллекция удалена 🤕, идём в инвентарь ');
          router.push(
            Routing.User.detail({
              params: { id: userId, tab: 'inventory' },
              query: { type: InventoryTab.COLLECTIONS },
            })
          );
        }}
        key="delete"
        collectionId={collectionId}
        userId={userId}
      >
        <Button disabled={linking} variant="destructive">
          Удалить
        </Button>
      </RemoveCollectionCards>
      <SubmitAction key="submit" loading={linking} compoundOnSubmitHandler={onSubmit} />
    </ManageCardCollectionBottomActionsSlot>
  );
};
