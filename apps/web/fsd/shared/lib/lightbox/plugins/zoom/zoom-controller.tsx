import * as React from 'react';

import { useController } from '../../modules/controller/store';
import type { ComponentProps as LightBoxComponentProps, ContainerRect, ZoomRef } from '../../types';
import { makeUseContext } from '../../utils';
import {
  useZoomCallback,
  useZoomImageRect,
  useZoomProps,
  useZoomSensors,
  useZoomState,
} from './hooks';

export type ActiveZoomWrapper = {
  zoomWrapperRef: React.RefObject<HTMLDivElement | null>;
  imageDimensions?: ContainerRect;
};

export type ZoomControllerContextType = ZoomRef & {
  setZoomWrapper: React.Dispatch<React.SetStateAction<ActiveZoomWrapper | undefined>>;
};

export const ZoomControllerContext = React.createContext<ZoomControllerContextType | null>(null);

export const useZoom = makeUseContext('useZoom', 'ZoomControllerContext', ZoomControllerContext);

export function ZoomContextProvider({ children }: LightBoxComponentProps) {
  const [zoomWrapper, setZoomWrapper] = React.useState<ActiveZoomWrapper>();

  const { slideRect } = useController();
  const { imageRect, maxZoom } = useZoomImageRect(slideRect, zoomWrapper?.imageDimensions);

  const { zoom, offsetX, offsetY, disabled, changeZoom, changeOffsets, zoomIn, zoomOut } =
    useZoomState(imageRect, maxZoom, zoomWrapper?.zoomWrapperRef);

  useZoomCallback(zoom * 0.8, disabled);

  useZoomSensors(
    zoom * 0.8,
    maxZoom,
    disabled,
    changeZoom,
    changeOffsets,
    zoomWrapper?.zoomWrapperRef
  );

  const zoomRef = React.useMemo(
    () => ({ zoom, maxZoom, offsetX, offsetY, disabled, zoomIn, zoomOut, changeZoom }),
    [zoom, maxZoom, offsetX, offsetY, disabled, zoomIn, zoomOut, changeZoom]
  );

  React.useImperativeHandle(useZoomProps().ref, () => zoomRef, [zoomRef]);

  const context = React.useMemo(() => ({ ...zoomRef, setZoomWrapper }), [zoomRef, setZoomWrapper]);

  return (
    <ZoomControllerContext.Provider value={context}>{children}</ZoomControllerContext.Provider>
  );
}
