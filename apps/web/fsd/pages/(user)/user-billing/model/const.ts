export enum UserBillingTab {
  COINS = 'coins',
  MONEY = 'money',
  TICKETS = 'tickets',
}

export const billingTabs: { id: UserBillingTab; disabled?: boolean }[] = [
  { id: UserBillingTab.COINS, disabled: true },
  { id: UserBillingTab.MONEY },
  { id: UserBillingTab.TICKETS },
];
