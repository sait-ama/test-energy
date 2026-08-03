import type { SpecialOffer } from '~shared/api/models/billing';
import { SpecialOfferType } from '~shared/api/models/billing';

export const getSpecialOfferText = (offer: SpecialOffer) => {
  const bonus = parseInt(offer.charge_bonus ?? '0', 10);
  const minCharge = parseInt(offer.min_charge ?? '0', 10);

  if (offer.type === SpecialOfferType.SUM) {
    return `Специальное предложение! Пополни минимум на сумму ${minCharge} руб. и получи ${bonus} тикета `; // todo: intl + plural
  }

  if (offer.type === SpecialOfferType.MULTIPLY) {
    return `Специальное предложение! Пополни баланс на сумму от ${minCharge} руб. и получи в ${bonus} раз больше тикетов!`;
  }

  if (offer.type === SpecialOfferType.SUBSCRIPTION_DISCOUNT) {
    return `Специальное предложение! Купи подписку со скидкой ${bonus}%. Больше информации в профиле твоего аккаунта!`;
  }

  return 'Тип не определен';
};
