import Image, { ImageProps } from 'next/image';

import { cn } from '@re/ui-kit/utils/cn';

import { UrlFormatter } from '~shared/utils/url-formatter';

export const BackgroundItem = ({
  className,
  width,
  height,
  alt,
  mediaServer = false,
  src,
  ...props
}: ImageProps & { mediaServer?: boolean }) => {
  return (
    <Image
      loading="lazy"
      priority={false}
      width={width}
      height={height}
      src={mediaServer ? UrlFormatter.media(src) : src}
      alt={alt}
      className={cn('pointer-events-none absolute opacity-[0.5] select-none', className)}
      {...props}
    />
  );
};
