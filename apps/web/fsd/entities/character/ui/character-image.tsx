import { PersonIcon } from '@re/ui-kit/icons/person';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import type { ImageContentPropsExtendable } from '~shared/ui/image';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';

interface CharacterImageProps extends Omit<ImageContentPropsExtendable, 'src'> {
  imgSrc?: string;
  size?: number;
  imageClassName?: string;
}

export const CharacterImage = (props: CharacterImageProps) => {
  const { imgSrc, isLoading, className, imageClassName, alt, style, size = 64, ...rest } = props;

  return (
    <ImageRoot
      src={imgSrc}
      className={cn('aspect-square overflow-hidden rounded-sm', className)}
      style={{ ...style, width: size, height: size }}
      {...rest}
    >
      <SkeletonSlot
        show={isLoading}
        containerClassName="w-full"
        className="h-full"
        render={() => (
          <>
            <ImageContent
              alt={alt}
              width={size}
              height={size}
              className={cn(
                'rounded-sm object-cover transition-transform duration-300 group-hover:scale-105',
                imageClassName
              )}
            />
            <ImageFallback>
              <PersonIcon size={size * 0.75} className="text-muted-foreground" />
            </ImageFallback>
          </>
        )}
      />
    </ImageRoot>
  );
};
