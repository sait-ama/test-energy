import { useFormContext } from 'react-hook-form';

import {
  MAX_CARDS_4_COLLECTION,
  MAX_NAME_COLLECTION,
  MIN_CARDS_4_COLLECTION,
  MIN_NAME_COLLECTION,
} from '~features/(manage-card-collections)/manage-forms/model/consts';
import { CreateCollectionCardsClientFormType } from '~features/(manage-card-collections)/manage-forms/model/schema';

type Keys = {
  [K in keyof CreateCollectionCardsClientFormType]?: boolean;
};
export const useCanSave = (props?: Keys) => {
  const { cards: checkCards = true, name: checkName = true } = props ?? {};
  const {
    watch,
    formState: { dirtyFields },
  } = useFormContext<CreateCollectionCardsClientFormType>();

  const cardsValue = watch('cards');
  const nameValue = watch('name');

  const cardsLength = cardsValue?.length ?? 0;
  const nameLength = nameValue?.length ?? 0;

  const hasCardsDirty = checkCards && !!dirtyFields.cards;
  const hasNameDirty = checkName && !!dirtyFields.name;

  const isCardsValid =
    !checkCards || (cardsLength >= MIN_CARDS_4_COLLECTION && cardsLength <= MAX_CARDS_4_COLLECTION);

  const isNameValid =
    !checkName || (nameLength >= MIN_NAME_COLLECTION && nameLength <= MAX_NAME_COLLECTION);

  const hasRelevantDirty = (checkCards && hasCardsDirty) || (checkName && hasNameDirty);

  const hasMinimalCards = !checkCards || cardsLength > 0;
  const hasMinimalName = !checkName || nameLength > 0;
  //todo zod parse!
  return hasRelevantDirty && isCardsValid && isNameValid && hasMinimalCards && hasMinimalName;
};
