export type Type<Extends extends Record<string, unknown> = {}> = {
  id: number | string;
  name: string;
} & Extends;

export enum FormsTypes {
  TITLES = 'titles',
  CREATORS = 'creators',
  CARDS = 'cards',
  USERS = 'users',
  PUBLISHERS = 'publishers',
  REACTIONS = 'reactions',
  FRIENDS = 'friends/statuses',
  TICKETS_PAYMENTS = 'billing/tickets',
  ACTIVITY_PAYMENTS = 'coins-payments',
  MONEY_PAYMENTS = 'payments',
}

export interface FormSchema<T extends FormsTypes> {
  type: T;
  get: T extends FormsTypes.TITLES
    ? (
        | 'categories'
        | 'genres'
        | 'types'
        | 'status'
        | 'age_limit'
        | 'publishers'
        | 'relations'
        | 'forbidden_fields'
        | 'additional'
        | 'translate_status'
      )[]
    : T extends FormsTypes.TICKETS_PAYMENTS
      ? 'action_type'[]
      : T extends FormsTypes.MONEY_PAYMENTS
        ? ('type' | 'status')[]
        : T extends FormsTypes.CREATORS
          ? ('country' | 'type')[]
          : T extends FormsTypes.CARDS
            ? 'ranks'[]
            : T extends FormsTypes.USERS
              ? ('sex' | 'adult' | 'yaoi' | 'taglines' | 'achievements' | 'all_badges')[]
              : T extends FormsTypes.PUBLISHERS
                ? ('restrictions' | 'privileges' | 'type' | 'countries')[]
                : T extends FormsTypes.FRIENDS
                  ? 'statuses'[]
                  : never;
}
