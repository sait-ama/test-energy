import { ComponentProps } from 'react';

import { CardCollection } from '@re/api/generated/types.gen';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { resolvedName } from '~entities/card-collections/model/utils';
import {
  BaseCollectionCard,
  BaseCollectionCardList,
  BaseCollectionCardListContent,
  BaseCollectionWrapper,
} from '~entities/card-collections/ui/styles/base-card';
import { CardCollectionAmount } from '~entities/card-collections/ui/styles/card-collection-amount';
import { HeroCard } from '~entities/inventory/ui/hero-card';
import { HeroCardPreviewModalTrigger } from '~entities/inventory/ui/hero-card-preview';
import { MAX_CARDS_4_COLLECTION } from '~features/(manage-card-collections)/manage-forms/model/consts';
import { UserCardActions } from '~widgets/card-collections/ui/user-card-actions';

export interface UserCardCollectionCardProps extends ComponentProps<'div'> {
  model: CardCollection;
  heroAttr?: ComponentProps<'div'> | { 'data-index': number };
}

export const UserCardCollectionCard = ({ model: item, heroAttr }: UserCardCollectionCardProps) => {
  return (
    <BaseCollectionWrapper key={item.id}>
      <BaseCollectionCard
        overrideHeaderSlots={
          <div className="flex w-full flex-wrap items-center">
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex flex-row items-center gap-2">
                <ReText breakable lineClamp={1} className="line-clamp-1 break-all">
                  {resolvedName(item.name)}
                </ReText>
                <CardCollectionAmount
                  amount={MAX_CARDS_4_COLLECTION}
                  currentAmount={item.cards.length}
                />
              </div>
              <UserCardActions className="max-sm:self-start" collection={item} key={item.id} />
            </div>
          </div>
        }
        withEmptySlots
        model={item}
        key={item.id}
      >
        <BaseCollectionCardListContent>
          <BaseCollectionCardList<typeof item> withEmptySlots>
            {({ item: card, isEmpty }) => (
              <HeroCardPreviewModalTrigger card={card.card} asChild>
                <HeroCard
                  {...heroAttr}
                  imgClassName={cn(
                    'transition:hover duration-200 size-full bg-secondary hover:bg-muted'
                  )}
                  withHover
                  imgSize="high"
                  className={cn('hover:bg-muted')}
                  withBorder={false}
                  loading={isEmpty}
                  card={card.card}
                  key={item.id}
                />
              </HeroCardPreviewModalTrigger>
            )}
          </BaseCollectionCardList>
        </BaseCollectionCardListContent>
      </BaseCollectionCard>
    </BaseCollectionWrapper>
  );
};
