import { SiteConfig } from '~shared/config/constants';

export type FalsySessionId = number | undefined;
export type FeaturesFlagParams = {
  features: SiteConfig['features'];
};
export interface CreateParamsType {
  sessionId: FalsySessionId;
}
export interface ReadParamsType extends FeaturesFlagParams {}
export type AllParamsType = ReadParamsType & CreateParamsType;
