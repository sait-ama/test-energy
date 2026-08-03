import * as React from 'react';

import { createContext } from '@re/core/utils/create-context';

import { Callback, ContainerRect, ControllerRef } from '~shared/lib/lightbox';
import { SubscribeSensors } from '~shared/lib/lightbox/hooks/use-sensors';

export type ControllerContextType = Pick<ControllerRef, 'prev' | 'next' | 'close'> & {
  focus: Callback;
  slideRect: ContainerRect;
  containerRect: ContainerRect;
  subscribeSensors: SubscribeSensors<HTMLDivElement>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setCarouselRef: React.Ref<HTMLDivElement>;
  toolbarWidth: number | undefined;
  setToolbarWidth: (width: number | undefined) => void;
};
export const { useStore: useController, Context: ControllerContext } = createContext<
  ControllerContextType,
  ControllerContextType
>((v) => v, 'ControllerContext');
