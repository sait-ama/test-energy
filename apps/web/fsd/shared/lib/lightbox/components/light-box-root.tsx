import * as React from 'react';

import { useForkRef } from '~shared/hooks/use-fork-ref';
import { DocumentContextProvider } from '~shared/lib/lightbox/stores/document-store';

import { clsx, cssClass } from '../utils';

const LightBoxRoot = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(
  function LightboxRoot({ className, children, ...rest }, ref) {
    const nodeRef = React.useRef<HTMLDivElement>(null);

    return (
      <DocumentContextProvider nodeRef={nodeRef}>
        <div ref={useForkRef(ref, nodeRef)} className={clsx(cssClass('root'), className)} {...rest}>
          {children}
        </div>
      </DocumentContextProvider>
    );
  }
);

export { LightBoxRoot };
