import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import Title from '~shared/assets/placeholders/title';
import type { ImageContentPropsExtendable } from '~shared/ui/image';
import { ImageContent, ImageFallback, ImageRoot } from '~shared/ui/image';

interface HeroCardImageProps extends Omit<ImageContentPropsExtendable, 'src'> {
  isLoading?: boolean;
  src: string | undefined;
}

export const HeroCardImage = (props: HeroCardImageProps) => {
  const { src, style, isLoading, className, alt, ...rest } = props;

  return (
    <ImageRoot
      src={src}
      className={cn('aspect-[2/3] w-full overflow-hidden rounded-sm', className)}
      style={style}
    >
      <SkeletonSlot
        show={isLoading}
        containerClassName="w-full"
        className="h-full"
        render={() => (
          <div className="size-full transition-transform duration-300 group-hover:scale-105">
            <ImageContent alt={alt} {...rest} fill className="rounded-sm" />
            <ImageFallback>
              <Title size={36} className="text-muted-foreground" />
            </ImageFallback>
          </div>
        )}
      />
    </ImageRoot>
  );
};
