import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarImageProps,
  AvatarProps,
} from '@re/ui-kit/ui/avatar';
import { cn } from '@re/ui-kit/utils/cn';

import { UrlFormatter } from '~shared/utils/url-formatter';

type PublisherImageProps = {
  imgSrc?: string;
  isLoading?: boolean;
  size?: number;
  priority?: boolean;
} & Omit<AvatarProps, 'children' | 'src'> &
  Pick<AvatarImageProps, 'className' | 'style'>;

export const PublisherAvatar = (props: PublisherImageProps) => {
  const { imgSrc, isLoading, size, className, style = {}, alt, ...rest } = props;

  return (
    <Avatar
      src={UrlFormatter.media(imgSrc)}
      className={cn('aspect-square overflow-hidden rounded-sm select-none', className)}
      style={{ ...style, width: size, height: size }}
    >
      <AvatarImage alt={alt!} width={size} height={size} className="rounded-sm" {...rest} />
      <AvatarFallback>{alt}</AvatarFallback>
    </Avatar>
  );
};
