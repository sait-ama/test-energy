import React, { forwardRef, useEffect, useState } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { UrlFormatter } from '~shared/utils/url-formatter';

export type BaseImageProps = React.ComponentPropsWithRef<'img'>;

export const BaseImage = forwardRef<HTMLImageElement, BaseImageProps>(function BaseImage(
  { src, ...props },
  ref
) {
  const { className: propsClassName, onError: propsOnError } = props;
  const [error, setError] = useState(false);

  useEffect(
    () => () => {
      setError(false);
    },
    [src]
  );

  return (
    <img
      src={UrlFormatter.media(src)}
      {...props}
      className={cn(propsClassName, '', {
        '': error,
      })}
      onError={(e) => {
        setError(true);
        propsOnError?.(e);
      }}
      ref={ref}
    />
  );
});
