import { createModule } from '../../config';
import { PLUGIN_ZOOM } from '../../consts';
import type { Plugin } from '../../types';
import { addToolbarButton, isImageSlide } from '../../utils';
import { resolveZoomProps } from './props';
import { ZoomContextProvider } from './zoom-controller';
import { ZoomToolbarControl } from './zoom-toolbar-control';
import { ZoomWrapper } from './zoom-wrapper';

/** Zoom plugin */
export const Zoom: Plugin = ({ augment, addModule }) => {
  augment(({ zoom: zoomProps, toolbar, render, controller, ...restProps }) => {
    const zoom = resolveZoomProps(zoomProps);
    return {
      zoom,
      toolbar: addToolbarButton(toolbar, PLUGIN_ZOOM, <ZoomToolbarControl />),
      render: {
        ...render,
        slide: (props) =>
          isImageSlide(props.slide) ? (
            <ZoomWrapper render={render} {...props} />
          ) : (
            render.slide?.(props)
          ),
      },
      controller: { ...controller, preventDefaultWheelY: zoom.scrollToZoom },
      ...restProps,
    };
  });

  addModule(createModule(PLUGIN_ZOOM, ZoomContextProvider));
};
