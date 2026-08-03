export enum ChargeCurrencies {
  RUB = 'RUB',
  USD = 'USD',
  KZT = 'KZT',
  GEL = 'GEL',
}

export interface ChargeMethod {
  active: boolean;
  allow_bonus: boolean;
  service: string;
  codes: ChargeCurrencies[];
  default: boolean;
  name: string;
  commission: number;
  subinfo: string;
  provider: number;
}

export enum SpecialOfferType {
  SUM = 1,
  MULTIPLY = 2,
  SUBSCRIPTION_DISCOUNT = 3,
}

export interface SpecialOffer {
  type: SpecialOfferType;
  charge_bonus: string;
  min_charge: string;
}

export interface ChargeSchema {
  bonus: [number, number][];
  charge_methods: ChargeMethod[];
  special_offer: SpecialOffer | null;
}

export interface ChargeResponseSchema extends ChargeSchema {}

export interface CreateChargeRequestSchema {
  sum: number;
  currency: ChargeCurrencies;
  service: string;
}

export interface CreateChargeResponseSchema {
  link: string;
  tracking_code: string;
}

export enum PaypalActionType {
  CAPTURE = 'capture',
  CANCEL = 'cancel',
}

export interface CreatePaypalActionRequestSchema {
  action: PaypalActionType;
  token: string;
}

export type CreatePaypalActionResponseSchema = void;

export interface ExchangeRateQuerySchema {
  currency: ChargeCurrencies;
}
export interface WithDrawByIdParamsSchema {
  id: NumberIsomorphic;
}
export interface ExchangeRateResponseSchema {
  exchage_rate: number;
}
export interface WithDrawRequestSchema {
  publisher: number;
  sum: string;
  purse: string;
}

export type CurrencyExchangeRateResponseSchema = CurrencyExchangeRateSchema;

export interface CurrencyExchangeRateSchema {
  money_rate: number;
  ticket_rate: number;
}

export interface CurrencyExchangeRequestSchema {
  amount: number;
  currency: 'money' | 'ticket' | undefined;
}

export interface DonateRequestSchema {
  sum: number;
  publisher: number;
}
