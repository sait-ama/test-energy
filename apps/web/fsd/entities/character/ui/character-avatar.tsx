import { Avatar, AvatarFallback, AvatarImage, AvatarProps } from '@re/ui-kit/ui/avatar';

import { UrlFormatter } from '~shared/utils/url-formatter';

interface CharacterAvatarProps extends Omit<AvatarProps, 'src'> {
  src?: string;
  size?: number;
  imageClassName?: string;
  alt: string;
}

export const CharacterAvatar = (props: CharacterAvatarProps) => {
  const { src, className, imageClassName, alt, style, size = 64, ...rest } = props;

  return (
    <Avatar
      src={UrlFormatter.media(src)}
      size={size}
      className={className}
      style={{ ...style }}
      shape="square"
      {...rest}
    >
      <AvatarImage alt={alt} className={imageClassName} />
      <AvatarFallback>{alt}</AvatarFallback>
    </Avatar>
  );
};
