'use client';
import { useEffect, useLayoutEffect } from 'react';

import { hasWindow } from '~shared/utils/device';

export const useIsomorphicEffect = hasWindow() ? useLayoutEffect : useEffect;
