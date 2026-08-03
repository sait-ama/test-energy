import { chain } from '@nimpl/middleware-chain';

import {
  config as catalogRouteNormalizeRewriteConfig,
  middleware as catalogRouteNormalizeRewriteMiddleware,
} from '~app/middlewares/catalog-route-normalize-rewrite';
// import { config as contentRedirectConfig, middleware as contentRedirectMiddleware } from '~app/middlewares/content-redirect';
import {
  config as contentRewriteConfig,
  middleware as contentRewriteMiddleware,
} from '~app/middlewares/content-rewrite';
import {
  config as referralConfig,
  middleware as referralMiddleware,
} from '~app/middlewares/referral';
import {
  config as userInventoryConfig,
  middleware as userInventoryMiddleware,
} from '~app/middlewares/user-inventory-rewrite';
import { config as utmConfig, middleware as utmMiddleware } from '~app/middlewares/utm';

import {
  config as paymentsActionsConfig,
  middleware as paymentsActionsMiddleware,
} from './payments-actions';
import {
  config as protectedRouteGuardConfig,
  middleware as protectedRouteGuardMiddleware,
} from './protected-route-guard';
import { config as socialConfig, middleware as socialMiddleware } from './social';
import { config as syncCookiesConfig, middleware as syncCookiesMiddleware } from './sync-cookies';
import {
  config as userSubmitMiddlewareConfig,
  middleware as userSubmitMiddleware,
} from './user-submit';

export const rootMiddleware = chain([
  [protectedRouteGuardMiddleware, protectedRouteGuardConfig],
  [contentRewriteMiddleware, contentRewriteConfig],
  // catalog rewrite after content rewrite
  [catalogRouteNormalizeRewriteMiddleware, catalogRouteNormalizeRewriteConfig],
  [socialMiddleware, socialConfig],
  [paymentsActionsMiddleware, paymentsActionsConfig],
  [userSubmitMiddleware, userSubmitMiddlewareConfig],
  [referralMiddleware, referralConfig],
  [utmMiddleware, utmConfig],
  // cookie sync should after logging (socialLoginMiddleware, userSubmitMiddleware)
  [syncCookiesMiddleware, syncCookiesConfig],
  [userInventoryMiddleware, userInventoryConfig],
]);
