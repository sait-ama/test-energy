import * as React from 'react';

import { createModule } from '../config';
import { MODULE_ROOT } from '../consts';
import { LightBoxComponentProps } from '../types';

export function Root({ children }: LightBoxComponentProps) {
  return <>{children}</>;
}

export const RootModule = createModule(MODULE_ROOT, Root);
