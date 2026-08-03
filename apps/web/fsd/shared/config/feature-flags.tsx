// import { createContextSelector } from '@re/core/utils/create-context-selector';
// import { CurrentUserSchemaResponse } from '~shared/api/models/user';
// import { useDomain } from '~app/providers/domain-provider';
// import { NArray } from '~shared/utils/NArray';
//
// enum STATIC_FEATURES {
//     'BATTLEPASS' = 'BATTLEPASS',
// }
//
// enum DYNAMIC_FEATURES {
//     'PREMIUM_SUBSCRIPTION' = 'PREMIUM_SUBSCRIPTION',
// }
//
// type FEATURES = DYNAMIC_FEATURES | STATIC_FEATURES;
//
// interface Feature {
//     name: FEATURES;
//     decide: () => boolean;
// }
//
// interface FeatureContext {
//     session: CurrentUserSchemaResponse | undefined;
// }
//
// interface FeatureController {
//     isEnabled: (feature: FEATURES) => boolean;
// }
//
// export const { Provider, useStore } = createContextSelector<FeatureController, FeatureContext>((ctx) => {
//     const features = useDomain((v) => v.features);
//
//     if (ctx.session) {
//         features.push({
//             name: DYNAMIC_FEATURES.PREMIUM_SUBSCRIPTION,
//             decide: () => ctx.session!.can_buy_premium_type,
//         });
//     }
//
//     const featureByName = NArray.newBy(features).recordBy(
//         (it) => it.name,
//         (it) => it,
//     );
//
//     return {
//         isEnabled: (feature) => featureByName[feature].decide(),
//     };
// });
//
// export const flags: Feature[] = [
//     {
//         name: STATIC_FEATURES.BATTLEPASS,
//         decide: () => true,
//     },
// ];

import { useSiteConfig } from '~app/providers/site-config-provider';

export enum Features {
  BATTLEPASS = 'BATTLEPASS',
  EMOJIS = 'EMOJIS',
  STICKERS = 'STICKERS',
  FORUM = 'FORUM',
  OLD_VERSION_SWITCH = 'OLD_VERSION_SWITCH',
  EXTERNAL_TITLE_ADAPTATION = 'EXTERNAL_TITLE_ADAPTATION',
  CHAT = 'CHAT',
  SHORTS = 'SHORTS',
  REGISTER_BY_MAIL = 'REGISTER_BY_MAIL',
  CARD_GEN = 'CARD_GEN',
}

interface FeatureFlagBoundaryProps {
  name: Features;
  children: React.ReactNode;
}

export const FeatureFlagBoundary = (props: FeatureFlagBoundaryProps) => {
  const { name, children } = props;
  const flag = useSiteConfig((v) => !!v?.features?.[name]);

  if (!flag) return null;

  return children;
};
