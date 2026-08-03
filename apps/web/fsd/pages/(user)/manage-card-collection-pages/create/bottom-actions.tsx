import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { CollectionType } from '~entities/card-collections/model/queries';
import { ChangeOrderingButtonTrigger } from '~features/(manage-card-collections)/actions/change-ordering';
import { useCreateCollectionCards } from '~features/(manage-card-collections)/manage-forms/model/mutations';
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

export const manageCardCollectionTriggerId = 'manage-card-collection-trigger';

export const BottomActions = () => {
  const sessionId = useSession((v) => v?.id);
  const { mutateAsync } = useCreateCollectionCards();
  const router = useRouter();
  const form = useFormContext();
  const resolver = useErrorHandler({ form });
  const onSubmit: SubmitActionProps['compoundOnSubmitHandler'] = useCallback(
    async (values) => {
      try {
        const [collection, toast] = await Promise.all([
          mutateAsync({ path: { user_id: sessionId! }, body: values }),
          importToastAsync(),
        ]);
        if (collection) {
          toast.success('Коллекция успешно создана, идёт переадресация');
          router.push(
            Routing.User.detail({
              params: { id: sessionId!, tab: 'inventory' },
              query: {
                type: InventoryTab.COLLECTIONS,
                collectionCardType: CollectionType.USER,
              },
            })
          );
        }
      } catch (error) {
        await resolver(error);
        logger.error(error);
      }
    },
    [resolver, form]
  );
  return (
    <ManageCardCollectionBottomActionsSlot>
      <ChangeOrderingButtonTrigger />
      <SubmitAction compoundOnSubmitHandler={onSubmit} />
    </ManageCardCollectionBottomActionsSlot>
  );
};
