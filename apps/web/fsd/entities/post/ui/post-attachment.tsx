import { type ComponentPropsWithoutRef } from 'react';

import { cn } from '@re/ui-kit/utils/cn';

export const ImageAttachment = ({
  url,
  onClick,
  className,
  ...props
}: { url?: string } & ComponentPropsWithoutRef<'div'>) => {
  if (!url) return null;

  return (
    <div
      onClick={onClick}
      {...props}
      className={cn(
        'relative z-1 flex h-full w-full items-center justify-center overflow-hidden rounded-md',
        className
      )}
    >
      <div
        className="absolute inset-0 z-[-1] h-full w-full opacity-30 blur-md"
        style={{
          background: `url(${url}) no-repeat center/cover`,
        }}
      />
      <img
        alt="изображение поста"
        decoding="async"
        loading="lazy"
        aria-label="главная картинка поста"
        className={cn('flex h-full max-h-[320px]')}
        src={url}
      />
    </div>
  );
};
