import { useLayoutEffect as ReactUseLayoutEffect } from 'react';

export const useLayoutEffect = globalThis?.document ? ReactUseLayoutEffect : () => {};
