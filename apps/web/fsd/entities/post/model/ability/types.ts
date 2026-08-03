import { SiteConfig } from '~shared/config/constants';

export type AbilityFn<TArg extends object> = (arg: TArg) => boolean;
export type PostAuthorUserId = number | undefined;
export type FalsySessionId = number | undefined;
export type SessionParams = {
  sessionId: FalsySessionId;
  isSuper: boolean;
  isStaff: boolean;
};
export type FeaturesFlagParams = {
  features: SiteConfig['features'];
};
