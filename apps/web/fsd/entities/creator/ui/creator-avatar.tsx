import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarImageProps,
  AvatarProps,
} from '@re/ui-kit/ui/avatar';

import { UrlFormatter } from '~shared/utils/url-formatter';

type CreatorAvatarProps = Omit<AvatarProps, 'src'> &
  AvatarImageProps & {
    src?: string;
  };

export const CreatorAvatar = (
  props: CreatorAvatarProps & {
    priority?: boolean;
  }
) => {
  const { src, shape = 'square', className, size = 64, alt, ...rest } = props;

  return (
    <Avatar src={UrlFormatter.media(src)} size={size} className={className} shape={shape}>
      <AvatarImage alt={alt ?? 'Аватар создателя'} size={size} {...rest} />
      <AvatarFallback>{alt}</AvatarFallback>
    </Avatar>
  );
};
