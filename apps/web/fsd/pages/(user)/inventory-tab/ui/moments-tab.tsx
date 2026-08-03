import { useParams } from 'next/navigation';

import { querySuspenseInfiniteOptions } from '@re/api/exports-core';

import { reV2InventoryItemsMomentsRetrieveInfiniteOptions } from '~entities/inventory/model/queries';
import { MomentsMasonryList } from '~features/(moments)/moments-masonry-list/ui/moment-masonry-list';

export const MomentsTab = () => {
  const params = useParams<{ id: string }>();

  return (
    <MomentsMasonryList
      className="cs-inventory-section"
      options={querySuspenseInfiniteOptions(
        reV2InventoryItemsMomentsRetrieveInfiniteOptions({
          api: {
            path: {
              user_id: Number(params.id),
            },
          },
          suspense: true,
        })
      )}
    />
  );
};
