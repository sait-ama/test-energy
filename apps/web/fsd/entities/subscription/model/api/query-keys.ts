import { queryKit } from '~shared/api/react-query';

export namespace SubscriptionKeys {
  export const getSubscriptionInfo = queryKit.createQueryKey<void, void>(() => [
    'subscription',
    { authDepend: true },
  ]);
}
