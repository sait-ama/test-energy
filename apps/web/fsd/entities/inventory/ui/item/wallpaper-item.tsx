import CheckIcon from '@re/ui-kit/icons/active-check';
import { MediaContent, MediaRoot } from '@re/ui-kit/ui/media';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import type { ImageContentProps } from '~shared/ui/image';
import * as InventoryItem from '~shared/ui/item-card';

export const WallpaperItemImage = (
  props: ImageContentProps & { withHover?: boolean; preview?: boolean }
) => {
  const {
    width = 1920,
    height = 1080,
    preview,
    withHover,
    src = '',
    children,
    alt,
    className,
    ...rest
  } = props;

  return (
    <MediaRoot src={src} className={cn(withHover && 'group overflow-hidden', 'w-full')}>
      <MediaContent
        width={width}
        height={height}
        className={cn(
          'aspect-[3/2] max-h-[154px] w-full rounded-sm object-cover',
          withHover && 'transition-all duration-300 group-hover:scale-105',
          className
        )}
        alt={alt}
        {...rest}
      />
      {children}
    </MediaRoot>
  );
};

export type WallpaperItemProps = {
  isUsing?: boolean;
  withHover?: boolean;
  imgSrc?: ImageContentProps['src'];
  isLoading?: boolean;
  alt?: string;
} & Omit<ImageContentProps, 'src' | 'alt'>;

export const WallpaperItem = (props: WallpaperItemProps) => {
  const { imgSrc, isUsing = false, withHover, isLoading } = props;

  return (
    <InventoryItem.Root withHover={withHover}>
      <InventoryItem.Content>
        <SkeletonSlot
          className="h-[100px] w-[180px] rounded-xs"
          show={isLoading}
          render={<WallpaperItemImage src={imgSrc} alt="Обои" />}
        />
      </InventoryItem.Content>
      <InventoryItem.Footer>
        <InventoryItem.Label>Обои</InventoryItem.Label>
        {isUsing ? <CheckIcon /> : null}
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
};
