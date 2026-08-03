import { memo } from 'react';

import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import Title from '~shared/assets/placeholders/title';
import type { ImageContentProps } from '~shared/ui/image';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';

type TitleImageProps = ImageContentProps & {
  fixed?: boolean;
  isLoading?: boolean;
  size?: number;
};

export const TitleImage = memo((props: TitleImageProps) => {
  const { src, style, isLoading, className, size, ...rest } = props;

  const widthComputed = ((size ?? 0) / 3) * 2;
  const width = widthComputed || undefined;
  const height = size;

  return (
    <ImageRoot
      src={src}
      className={cn('aspect-[2/3] w-full overflow-hidden rounded-sm select-none', className)}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <SkeletonSlot
        show={isLoading}
        containerClassName="w-full"
        className="h-full"
        render={
          <>
            <ImageContent
              width={width}
              height={height}
              selectable={false}
              {...rest}
              className="size-full object-cover transition-all duration-200"
            />
            <ImageFallback>
              <Title size={36} className="text-muted-foreground" />
            </ImageFallback>
          </>
        }
      />
    </ImageRoot>
  );
});
