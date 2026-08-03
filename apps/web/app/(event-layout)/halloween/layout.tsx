import { PropsWithChildren } from 'react';

import { NextPageParams } from '~shared/types/next';

interface HalloweenPromoLayout extends NextPageParams, PropsWithChildren {}
const HalloweenPromoLayout = ({ children }: HalloweenPromoLayout) => {
  return <>{children}</>;
};
export default HalloweenPromoLayout;
export const dynamic = 'auto';
export const revalidate = false;
export const dynamicParams = false;
export const fetchCache = 'force-cache';
