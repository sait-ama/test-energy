import { SpecialOffer } from '~shared/api/models/billing';

export interface SubscriptionSchemaResponse {
  user_id: number;
  charge_type: ChargeType;
  count_titles: number;
  date: string;
  date_end: string;
  date_start: string;
  default_price: string;
  discount: number;
  is_renew: boolean;
  premium_titles: unknown[];
  price: string;
  status: SubscriptionStatus;
  subscription_type: SubscriptionType;
  special_offer?: SpecialOffer;
}

export enum ChargeType {
  TINKOFF_SUB = 'tinkoff-sub',
  BALANCE = 'balance',
}

export interface BuySubscriptionRequestSchema {
  buy_type: ChargeType;
}

export interface BuySubscriptionResponseSchema {
  link: string;
}

enum SubscriptionType {
  HUI,
  All_TITLES,
  TEN_TITLES,
  FIFTEEN_TITLES,
  TWENTY_TITLES,
}

enum SubscriptionStatus {
  NOT_ACTIVE,
  ACTIVE,
  NEED_EXTEND,
}

export enum PaymentTypes {
  coins = 'coins',
  card = 'card',
}
