'use client';

import { CollectionCard } from '~entities/collection/ui/collection-card';
import {
  CollectionSliderViewProps,
  CollectionsSliderRenderer,
} from '~entities/collection/ui/collections-slider-view-renderer';
import type { CollectionSchema } from '~shared/api/models/collectionSchema';

export const CollectionsSliderView = (
  props: Omit<CollectionSliderViewProps<CollectionSchema>, 'children'>
) => {
  return (
    <CollectionsSliderRenderer {...props}>
      {(item) => <CollectionCard withDescription model={item} className="bg-card aspect-square" />}
    </CollectionsSliderRenderer>
  );
};
