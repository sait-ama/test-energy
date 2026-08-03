import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useCharge, useExchangeRate } from '~entities/billing/model/queries';
import type { ChargeFormSchema } from '~features/charge/model/types';
import {
  ChargeCurrencies,
  ChargeMethod,
  SpecialOffer,
  SpecialOfferType,
} from '~shared/api/models/billing';

export const getActiveOfferIndex = (value: number, offers: [number, number][], strict = false) => {
  const foundedIndex = offers
    .slice()
    .reverse()
    .findIndex(([offerValue]) => {
      if (strict) {
        return offerValue === value;
      }
      return offerValue <= value;
    });

  return foundedIndex !== -1 ? offers.length - foundedIndex - 1 : -1;
};

export const getChargeMethodByServiceName = (methods: ChargeMethod[], serviceName: string) =>
  methods.find((m) => m.service === serviceName);

export const useActiveOfferIndex = (value: number, strict = false): number => {
  const { bonus: offers } = useCharge().data!;

  return getActiveOfferIndex(value, offers, strict);
};

export const useAmount = (): number => {
  const { control } = useFormContext<ChargeFormSchema>();

  return useWatch({ name: 'amount', control }) || 0;
};

export const useChargeMethod = (): string => {
  const { control } = useFormContext<ChargeFormSchema>();

  return useWatch({ name: 'method', control });
};

export const useChargeCoinLimits = (limitInRubles: number = 5000) => {
  const { charge_methods: methods } = useCharge().data!;

  const limits = useMemo(() => {
    const obj: Record<string, number> = {};
    methods.forEach((it) => {
      const limit = Math.round(((limitInRubles / (100 + it.commission)) * 100) / 5) * 5;
      obj[it.service] = limit;

      if (it.default) {
        obj.default = limit;
      }
    });

    return obj;
  }, [methods, limitInRubles]);

  return limits;
};

export const useChargeMethodFullInfo = (): ChargeMethod | undefined => {
  const { charge_methods: methods } = useCharge().data!;
  const method = useChargeMethod();
  return getChargeMethodByServiceName(methods, method);
};

export const useChargeFormFilled = (): boolean => {
  const { control } = useFormContext<ChargeFormSchema>();

  const amount = useWatch({ name: 'amount', control });
  const method = useWatch({ name: 'method', control });

  return !!(amount && method);
};

export const getBonusTicketsCount = (
  value: number,
  offers: [number, number][],
  specialOffer: SpecialOffer | null
) => {
  const offerIndex = getActiveOfferIndex(value, offers, true);
  const offer = offerIndex !== -1 ? offers[offerIndex][1] : 0;

  if (specialOffer) {
    const { type } = specialOffer;
    const bonus = parseInt(specialOffer.charge_bonus, 10);
    const minimal = parseInt(specialOffer.min_charge, 10);

    if (type === SpecialOfferType.SUM && value >= minimal) {
      return offer + bonus;
    }

    if (type === SpecialOfferType.MULTIPLY) {
      return offer * bonus;
    }
  }

  return offer;
};

export const useBonusTicketsCount = (value: number): number => {
  const { bonus: offers, special_offer } = useCharge().data!;

  return getBonusTicketsCount(value, offers, special_offer);
};

export const calculateCommissionValue = (amount: number, commission: number) => {
  const calculatedValue = amount * (1 / (1 - commission / 100) - 1);
  return parseFloat(calculatedValue.toFixed(2));
};

export const useChargeMeta = () => {
  const amount = useAmount();
  const chargeMethod = useChargeMethodFullInfo()!;
  const code = chargeMethod?.codes[0] ?? ChargeCurrencies.RUB;
  const { data, isLoading } = useExchangeRate(
    { variables: { query: { currency: code } } },
    { enabled: code !== ChargeCurrencies.RUB }
  );

  const exchangeRate = data?.exchage_rate ?? 1;
  const convertedPrice = parseFloat((amount * exchangeRate).toFixed(2));

  const commission = calculateCommissionValue(convertedPrice, chargeMethod.commission);

  return {
    isLoading,
    currency: code,
    rate: exchangeRate,
    commission,
    amount: convertedPrice,
  };
};
