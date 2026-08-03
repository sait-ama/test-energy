import { ComponentProps, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@re/ui-kit/utils/cn';

import { AbstractCollection } from '~entities/card-collections/model/types';
import {
  CardCollectionComp as _CardCollectionComp,
  CardCollectionComp,
  CardCollectionCompType,
} from '~entities/card-collections/ui/card-collection-comp';
import { MIN_CARDS_4_COLLECTION } from '~features/(manage-card-collections)/manage-forms/model/consts';
import { EmptyView } from '~shared/ui/empty-view';
import { Section, SectionTitle } from '~shared/ui/section';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseCollectionCardProps<T extends AbstractCollection<any>>
  extends Omit<ComponentProps<'div'>, 'children'> {
  rightSlot: ReactNode;
  model: T;
  overrideHeaderSlots?: ReactNode;
  withEmptySlots?: boolean;
  leftSlot: ReactNode;
  children: ((props: { item: T['cards'][number]; isEmpty?: boolean }) => ReactNode) | ReactNode;
}

export const BaseCollectionWrapper = ({ className, ...props }: ComponentProps<typeof Section>) => {
  return <Section {...props} className={cn('bg-card dark:bg-card transition', className)} />;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BaseCollectionCardList = <T extends AbstractCollection<any>>({
  withEmptySlots,
  children,
}: Omit<BaseCollectionCardProps<T>, 'model' | 'leftSlot' | 'rightSlot'> & {}) => {
  const CardCollectionComp: CardCollectionCompType<T['cards'][0]> = _CardCollectionComp;

  return (
    <CardCollectionComp.List.Items emptySlotsCount={withEmptySlots ? MIN_CARDS_4_COLLECTION : 0}>
      {({ item, isEmpty }) => (
        <div className="h-full">
          {!item ? (
            <CardCollectionComp.List.Slot className="bg-secondary" />
          ) : typeof children === 'function' ? (
            children({ item, isEmpty })
          ) : (
            children
          )}
        </div>
      )}
    </CardCollectionComp.List.Items>
  );
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BaseCollectionCardListContent = <T extends AbstractCollection<any>>({
  ...props
}: Omit<BaseCollectionCardProps<T>, 'model' | 'leftSlot' | 'rightSlot'> &
  Pick<
    ComponentProps<typeof CardCollectionComp.List.Content>,
    'hideNavigation' | 'floatSlot' | 'innerClassName'
  >) => {
  return (
    <CardCollectionComp.List.Content {...props}>
      {typeof props?.children === 'function' ? (
        <BaseCollectionCardList {...props} />
      ) : (
        props.children
      )}
    </CardCollectionComp.List.Content>
  );
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BaseCollectionCard = <T extends AbstractCollection<any>>({
  leftSlot,
  rightSlot,
  model,
  overrideHeaderSlots,
  withEmptySlots,
  children,
}: BaseCollectionCardProps<T>) => {
  const t = useTranslations('collections');
  const CardCollectionComp: CardCollectionCompType<T['cards'][0]> = _CardCollectionComp;

  return (
    <CardCollectionComp.Root key={model.id} collection={model}>
      {!overrideHeaderSlots && (
        <SectionTitle className="flex !w-full flex-row flex-wrap" aside={rightSlot}>
          {leftSlot}
        </SectionTitle>
      )}
      {overrideHeaderSlots}
      <EmptyView
        text={t('empty')}
        emoji="🎴"
        className="aspect-[2/3] h-[270px] max-sm:h-[250px]"
        isEmpty={!model.cards?.length}
      >
        {typeof children === 'function' ? (
          <BaseCollectionCardList children={children} withEmptySlots={withEmptySlots} />
        ) : (
          children
        )}
      </EmptyView>
    </CardCollectionComp.Root>
  );
};
