import React, { ReactNode, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

import { MAX_CARDS_4_COLLECTION } from '~features/(manage-card-collections)/manage-forms/model/consts';
import { CreateCollectionCardsClientFormType } from '~features/(manage-card-collections)/manage-forms/model/schema';
import { HeroCardItemSchema } from '~shared/api/models/inventory';
import { FormField } from '~shared/ui/form';

export type SelectCardHandler = (card: HeroCardItemSchema) => void;
export type Renderer = (props: {
  selectedCards: HeroCardItemSchema[];
  handleCardSelect: SelectCardHandler;
}) => ReactNode;
type SelectableCardsFieldProps = {
  maxCards?: number;
  children: Renderer;
};

export const SelectableCardsField = ({
  children,
  maxCards = MAX_CARDS_4_COLLECTION,
}: SelectableCardsFieldProps) => {
  const { control } = useFormContext<CreateCollectionCardsClientFormType>();
  //todo что-то с типизацией, tmp

  return (
    <FormField<CreateCollectionCardsClientFormType>
      control={control}
      name="cards"
      render={({ field }) => {
        const selectedCards = field.value as CreateCollectionCardsClientFormType['cards'];
        const handleCardSelect: SelectCardHandler = useCallback(
          (card) => {
            const newValue = selectedCards.find((v) => v.id === card.id)
              ? selectedCards.filter(({ id }) => id !== card.id)
              : selectedCards.length < maxCards
                ? [...selectedCards, card]
                : selectedCards;

            field.onChange(newValue);
          },
          [selectedCards, maxCards]
        );
        const rendererProps = useMemo(
          () => ({ handleCardSelect, selectedCards }),
          [handleCardSelect, selectedCards]
        );
        return children(rendererProps);
      }}
    />
  );
};
SelectableCardsField.fieldName = 'SelectableCardsField';
