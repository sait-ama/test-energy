import { createContext } from '@re/core/utils/create-context';

import { useScrollStore } from './scroll-store';

const { Provider: ScrollProvider, useStore: useScroll } = createContext(
  useScrollStore,
  'ShortsScrollProvider'
);

export { ScrollProvider, useScroll };
