import { ComponentProps, ComponentType, ReactNode } from 'react';

import { UserRareCollection } from '@re/api/generated/types.gen';

import {
  HeroCardPreview,
  HeroCardPreviewModalTrigger,
  HeroCardPreviewProps,
} from '~entities/inventory/ui/hero-card-preview';
import { InfoModalTrigger } from '~features/info-modal';
import { InfoModalType } from '~shared/api/models/info-modal';
import { ShortCardItemSchema } from '~shared/api/models/shop';

interface RewardDialogTriggerProps
  extends Omit<ComponentProps<typeof HeroCardPreviewModalTrigger>, 'children'> {
  card: UserRareCollection['reward_card'];
  options?: Omit<HeroCardPreviewProps<ComponentType>, 'card'>;
  children?: ReactNode;
}
//todo new HeroCard!!
export const RewardDialogTrigger = ({
  card,
  children,
  options: heroCardOptions,
}: RewardDialogTriggerProps) => {
  return (
    <InfoModalTrigger
      asChild
      options={{
        type: InfoModalType.CUSTOM,
        srOnly: 'Карточка',
        title: null,
        contentProps: {
          className: 'sm:mt-[170px] sm:max-w-[450px]',
        },
        content: <HeroCardPreview card={card as ShortCardItemSchema} {...heroCardOptions} />,
      }}
    >
      {children}
    </InfoModalTrigger>
  );
};
