import * as React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { LightboxPropsProvider } from '~shared/lib/lightbox/stores/lightbox-props';

import type { ComponentProps as LightBoxComponentProps, ThumbnailsRef } from '../../types';
import { cssClass, makeUseContext } from '../../utils';
import { resolveThumbnailsProps } from './props';
import { ThumbnailsTrack } from './thumbnails-track';
import { cssPrefix } from './utils';

import classes from './classes.module.scss';

export const ThumbnailsContext = React.createContext<ThumbnailsRef | null>(null);
export const useThumbnails = makeUseContext(
  'useThumbnails',
  'ThumbnailsContext',
  ThumbnailsContext
);

/** Thumbnails plugin component */
export function ThumbnailsContextProvider({ children, ...props }: LightBoxComponentProps) {
  const { ref, position, hidden } = resolveThumbnailsProps(props.thumbnails);
  const [visible, setVisible] = React.useState(!hidden);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const context = React.useMemo(
    () => ({
      visible,
      show: () => setVisible(true),
      hide: () => setVisible(false),
    }),
    [visible]
  );

  React.useImperativeHandle(ref, () => context, [context]);

  return (
    <LightboxPropsProvider {...props}>
      <ThumbnailsContext.Provider value={context}>
        <div
          ref={containerRef}
          className={cn(
            cssClass(cssPrefix()),
            classes.thumbnails,
            classes[`thumbnails_${position}`]
          )}
        >
          {['start', 'top'].includes(position) && (
            <ThumbnailsTrack containerRef={containerRef} visible={visible} />
          )}
          <div className={classes.wrapper}>{children}</div>
          {['end', 'bottom'].includes(position) && (
            <ThumbnailsTrack containerRef={containerRef} visible={visible} />
          )}
        </div>
      </ThumbnailsContext.Provider>
    </LightboxPropsProvider>
  );
}
