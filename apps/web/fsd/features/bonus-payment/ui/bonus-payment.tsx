'use client';

import React from 'react';

import { Button } from '@re/ui-kit/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@re/ui-kit/ui/dialog';
import { ReText } from '@re/ui-kit/ui/text';

import { useCharge } from '~entities/billing/model/queries';
import {
  ChargeOfferCardCardPremium,
  ChargeOfferCardCardStandard,
} from '~entities/billing/ui/charge-offer-card';
import { useChargeModal } from '~shared/lib/charge/use-charge-modal';
import { LinearGradient } from '~shared/ui/linear-gradient';
import { CookieService } from '~shared/utils/cookie-service';
import { UrlFormatter } from '~shared/utils/url-formatter';

export const BonusPaymentModal = ({ onClose }) => {
  const { data = {} } = useCharge();
  const { special_offer } = data;
  const { open } = useChargeModal();

  const onCloseModal = () => {
    if (onClose) onClose();
    CookieService.set('isBonusPromoHidden', true);
  };

  if (!special_offer) return null;

  const onOpenModal = () => {
    onCloseModal();
    open();
  };

  return (
    <Dialog open onOpenChange={onCloseModal}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Вы можете пополнить баланс с бонусом</DialogTitle>

        <div className="relative flex w-full flex-col items-center px-6 pt-6 pb-2">
          <div className="mb-[-160px] flex -translate-y-[180px] justify-center">
            <LinearGradient
              src={UrlFormatter.media('public/payment-bonus/girl.webp')}
              width={171}
              height={214}
              alt="Девочка"
            />
          </div>

          <ReText
            align="center"
            weight="bold"
            size="lg"
            className="mb-4 flex flex-col items-center"
          >
            Вам доступен повышенный бонус к пополнению
          </ReText>

          <div className="mb-4">
            <OffersListUiBase
              onCardClick={() => {
                onOpenModal();
              }}
            />
          </div>

          <ReText
            align="center"
            className="mb-5 flex flex-col items-center"
            size="sm"
            color="muted-foreground"
          >
            Вы можете пополнить Ваш баланс и получить при этом увеличенное колличество тикетов
          </ReText>
          <Button
            className="w-full"
            onClick={() => {
              onOpenModal();
            }}
          >
            Пополнить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OffersListUiBase = ({ onCardClick }: { onCardClick?: () => void }) => {
  const { bonus: offers, special_offer } = useCharge().data || { bonus: [] };

  if (!special_offer) return null;
  const getTickets = (amount: number, tickets: number) => {
    if (special_offer) {
      const { type } = special_offer;
      const bonus = parseInt(special_offer.charge_bonus, 10);
      const minimal = parseInt(special_offer.min_charge, 10);

      if (type === 1 && amount >= minimal) {
        return tickets + bonus;
      }

      if (type === 2) {
        return tickets * bonus;
      }
    }
    return tickets;
  };
  return (
    <div className="flex flex-wrap gap-2">
      {offers.slice(0, 4).map(([amount, tickets], index) => {
        const Card = index === 1 ? ChargeOfferCardCardPremium : ChargeOfferCardCardStandard;
        const bonus = getTickets(amount, tickets);
        return (
          <Card
            onClick={onCardClick}
            bonusTickets={bonus === tickets ? undefined : bonus}
            key={amount}
            tickets={tickets}
            amount={amount}
            isSelected={false}
          />
        );
      })}
    </div>
  );
};
