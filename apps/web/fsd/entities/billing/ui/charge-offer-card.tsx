import type { ReactNode } from 'react';
import { memo } from 'react';
import isEqual from 'react-fast-compare';
import { useFormContext } from 'react-hook-form';

import Coin from '@re/ui-kit/icons/coin';
import Ticket from '@re/ui-kit/icons/ticket';
import { Button } from '@re/ui-kit/ui/button';
import { ReText } from '@re/ui-kit/ui/text';
import { cn } from '@re/ui-kit/utils/cn';

import type { ChargeFormSchema } from '~features/charge/model/types';

interface ChargeOfferCardProps {
  amount: number;
  bonus?: number;
  tickets: number;
  background: ReactNode;
  isSelected: boolean;
  className?: string;
}

type ClickableChargeOfferCardProps = ChargeOfferCardProps & {
  onClick?: (amount?: number) => void;
};

const ChargeOfferCardBase = memo(
  (props: ClickableChargeOfferCardProps) => {
    const { amount, bonus, tickets, isSelected, background, className, onClick } = props;

    const handleClick = () => {
      onClick?.();
    };

    return (
      <Button
        fullWidth
        className={cn(
          'relative flex h-20 w-full flex-col items-start overflow-hidden transition-transform active:scale-[0.96]',
          // 'focus:scale-[0.96]',
          className,
          {
            'after:bg-background after:absolute after:inset-0 after:h-full after:w-full after:opacity-[30%]':
              isSelected,
          }
        )}
        onClick={handleClick}
      >
        <ReText size="md" className="z-10 flex items-center gap-1 tracking-wide" weight="semibold">
          {amount} <Coin size={18} />
        </ReText>
        <span
          className="z-10 flex gap-2 text-xs font-medium tracking-wide"
          style={{ textDecoration: bonus ? 'line-through' : 'auto' }}
        >
          + {bonus || tickets} тикетов
          <Ticket className="size-4 flex-shrink-0" />
        </span>
        {background}
        <Coin
          className="absolute right-0 bottom-0"
          style={{ transform: 'translate(25%,25%) rotate(130deg)' }}
          size={64}
        />
      </Button>
    );
  },
  (oldProps, newProps) => {
    const { onClick: _1, ...oldP } = oldProps;
    const { onClick: _2, ...newP } = newProps;
    return isEqual(oldP, newP);
  }
);

const ChargeOfferCard = (props: ChargeOfferCardProps) => {
  const { amount, ...other } = props;
  const { setValue } = useFormContext<ChargeFormSchema>();

  const handleClick = () => {
    setValue('amount', amount);
  };

  return <ChargeOfferCardBase {...other} onClick={handleClick} amount={amount} />;
};

const background = null;

const offerClassName =
  'relative p-5 rounded-sm bg-[linear-gradient(0deg,rgba(0,0,0,.2),rgba(0,0,0,.2)),linear-gradient(281.6deg,#5eaaf5_2.75%,#0d6dcd_91.65%)]  text-primary-content';

const premiumOfferClassName =
  'relative p-5 rounded-sm bg-[linear-gradient(279.87deg,#a055ff_21.91%,#e0325b_91.9%)] text-white">';

const ChargeOfferCardCardStandardBase = memo((props: Omit<ChargeOfferCardProps, 'background'>) => (
  <ChargeOfferCardBase {...props} className={offerClassName} background={background} />
));

const ChargeOfferCardCardStandard = memo((props: Omit<ChargeOfferCardProps, 'background'>) => (
  <ChargeOfferCard {...props} className={offerClassName} background={background} />
));
const ChargeOfferCardCardPremiumBase = memo((props: Omit<ChargeOfferCardProps, 'background'>) => (
  <ChargeOfferCardBase {...props} className={premiumOfferClassName} background={background} />
));
const ChargeOfferCardCardPremium = memo((props: Omit<ChargeOfferCardProps, 'background'>) => (
  <ChargeOfferCard {...props} className={premiumOfferClassName} background={background} />
));

export { ChargeOfferCardCardPremium, ChargeOfferCardCardStandard };
export { ChargeOfferCardCardPremiumBase, ChargeOfferCardCardStandardBase };
