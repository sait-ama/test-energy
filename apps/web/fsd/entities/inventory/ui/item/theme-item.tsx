import CheckIcon from '@re/ui-kit/icons/active-check';
import { MediaContent, MediaContentProps, MediaRoot } from '@re/ui-kit/ui/media';
import { SkeletonSlot } from '@re/ui-kit/ui/skeleton';
import { cn } from '@re/ui-kit/utils/cn';

import type { CustomizationItemType, CustomizationSchema } from '~shared/api/models/inventory';
import { useOpen } from '~shared/hooks/use-open';
import { useLogged } from '~shared/lib/session/use-logged';
import * as InventoryItem from '~shared/ui/item-card';
import { UrlFormatter } from '~shared/utils/url-formatter';
import {
  CustomizationItemModal,
  type CustomizationItemModalContentProps,
} from '~widgets/inventory/ui/customization-item-modal';

export const ThemeItemImage = (
  props: MediaContentProps & { withHover?: boolean; preview?: boolean }
) => {
  const {
    width = 1920,
    height = 1080,
    preview,
    children,
    withHover,
    src = '',
    alt,
    className,
    ...rest
  } = props;

  return (
    <MediaRoot
      src={UrlFormatter.media(src)}
      className={cn(withHover && 'group overflow-hidden', 'w-full')}
    >
      <MediaContent
        width={width}
        height={height}
        className={cn(
          'aspect-square w-full rounded-sm object-cover',
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

export interface ThemeItemProps {
  item?: CustomizationSchema<
    | CustomizationItemType.WALLPAPER
    | CustomizationItemType.FRAME
    | CustomizationItemType.AVATAR
    | CustomizationItemType.THEME
  >;
  name?: string;
  isUsing?: boolean;
  withHover?: boolean;
  isLoading?: boolean;
}

export const ThemeItem = (props: ThemeItemProps) => {
  const { item, isUsing = false, withHover = false, name, isLoading } = props;

  if (item && !item.theme) {
    return null;
  }

  return (
    <InventoryItem.Root withHover={withHover}>
      <InventoryItem.Content className="px-2">
        <SkeletonSlot
          className="size-32 rounded-xs"
          show={isLoading}
          render={<ThemeItemImage alt={item?.theme.name ?? ''} src={item?.theme.cover.mid ?? ''} />}
        />
      </InventoryItem.Content>
      <InventoryItem.Footer>
        <InventoryItem.Label>Тема</InventoryItem.Label>
        {!isLoading && isUsing ? <CheckIcon /> : null}
      </InventoryItem.Footer>
    </InventoryItem.Root>
  );
};

export type ThemeItemWithModalProps = Omit<CustomizationItemModalContentProps, 'imageSlot'>;

export const ThemeItemWithModal = (props: ThemeItemWithModalProps) => {
  const { item } = props;

  const isLogged = useLogged();
  const [open, toggle, close] = useOpen();

  if (item && !item.theme) {
    return null;
  }

  const content = <ThemeItem item={item} />;

  if (!isLogged) return content;

  return (
    <CustomizationItemModal.Root open={open} onOpenChange={toggle}>
      <CustomizationItemModal.Trigger>{content}</CustomizationItemModal.Trigger>
      <CustomizationItemModal.Content
        {...props}
        onSuccess={close}
        imageSlot={
          <ThemeItemImage
            preview
            alt="Theme"
            src={item.theme?.cover.high}
            size={192}
            className="w-full"
          />
        }
        className="max-w-[400px]"
      />
    </CustomizationItemModal.Root>
  );
};
