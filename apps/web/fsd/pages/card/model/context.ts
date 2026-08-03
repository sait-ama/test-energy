import { createContextSelector } from '@re/core/utils/create-context-selector';

import { useCardForms } from '~entities/inventory/model/queries';
import type { Type } from '~shared/api/models/forms';

export const { Provider: CardCatalogOptionsProvider, useStore: useCardCatalogOptions } =
  createContextSelector<Record<string, Type[]>, {}>(() => {
    const { data: cardFormsData } = useCardForms();
    const cardForms = cardFormsData?.content?.ranks || [];

    return {
      rank: [{ id: null, name: 'Все' }, ...cardForms],
    };
  });
