import { ImageProps } from 'next/image';

import { FrameItemImage } from '~entities/inventory/ui/item/frame-item';
import { ThemeItemImage } from '~entities/inventory/ui/item/theme-item';
import { WallpaperItemImage } from '~entities/inventory/ui/item/wallpaper-item';
import { UserAvatar } from '~entities/user/ui/user-avatar';
import { ShopItemTypes } from '~shared/api/models/shop';

export interface ShopItemImagePropsBase extends Omit<ImageProps, 'src'> {
  imgSrc?: string;
  frameSrc?: string | null;
}

export interface ShopItemImageProps extends ShopItemImagePropsBase {
  containerClassName?: string;
  //null equals unknown shopItem, render as avatar
  type: ShopItemTypes | null;
  avatarSrc: string | null;
  preview?: boolean;
  imgClassName?: string;
  className?: string;
  withAvatarFallback?: boolean;
}

export const ShopItemImage = (props: ShopItemImageProps) => {
  const {
    imgSrc = '',
    frameSrc = '',
    preview,
    withAvatarFallback = true,
    alt,
    type,
    children,
    width = 192,
    height = 192,
    avatarSrc,
    imgClassName,
    containerClassName,
    ...rest
  } = props;

  return type === ShopItemTypes.AVATAR ||
    type === ShopItemTypes.PACK ||
    type === ShopItemTypes._STICKER_PACK ||
    type === null ? (
    <UserAvatar
      imgClassName={imgClassName}
      alt={alt}
      withHover
      withFrameMargin={type !== ShopItemTypes.PACK}
      frameClassName="scale-121 md:scale-125 "
      avatarSrc={imgSrc}
      frameSrc={type === ShopItemTypes.PACK ? null : frameSrc}
      size={148}
      bottomSlot={children}
      {...rest}
    />
  ) : type === ShopItemTypes.FRAME ? (
    <FrameItemImage
      className={containerClassName}
      imgClassName={imgClassName}
      withAvatarFallback={withAvatarFallback}
      withHover
      avatarSrc={avatarSrc}
      bottomSlot={children}
      imgSrc={imgSrc}
      // width={Number(width)}
      // height={height}
      {...rest}
    />
  ) : type === ShopItemTypes.THEME ? (
    <ThemeItemImage
      className={containerClassName}
      alt=""
      preview={preview}
      withHover
      src={imgSrc}
      children={children}
      {...rest}
    />
  ) : (
    <WallpaperItemImage
      className={containerClassName}
      alt=""
      preview={preview}
      withHover
      src={imgSrc}
      children={children}
      {...rest}
    />
  );
};
