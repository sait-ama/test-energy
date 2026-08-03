import { ComponentProps } from 'react';
import { useTranslations } from 'next-intl';

import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import { UserPromoCodeForm } from '~features/use-promocode/ui/use-promocode';

interface UserPromoCodeHeader extends ComponentProps<'div'> {
  withTitle?: boolean;
}

export const UserPromoCodeFormSection = ({ className, withTitle = true }: UserPromoCodeHeader) => {
  const t = useTranslations('promo-codes');

  return (
    <div className={cn(className, 'flex max-w-[395px] flex-col gap-10')}>
      {withTitle && (
        <ReText align="center" className="md:text-[60px]" weight="bold" size="3xl">
          {t('title')}
        </ReText>
      )}
      <UserPromoCodeForm />
    </div>
  );
};
