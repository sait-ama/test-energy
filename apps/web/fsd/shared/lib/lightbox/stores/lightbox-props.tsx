import * as React from 'react';

import { LightBoxComponentProps } from '../types';
import { makeUseContext } from '../utils';

export type LightboxPropsContextType = Omit<LightBoxComponentProps, 'children'>;

export const LightboxPropsContext = React.createContext<LightboxPropsContextType | null>(null);

export const useLightboxProps = makeUseContext(
  'useLightboxProps',
  'LightboxPropsContext',
  LightboxPropsContext
);

export function LightboxPropsProvider({ children, ...props }: LightBoxComponentProps) {
  return <LightboxPropsContext.Provider value={props}>{children}</LightboxPropsContext.Provider>;
}
