import React from 'react';

import * as ReAvatar from '@re/ui-kit/ui/avatar';

import { UrlFormatter } from '~shared/utils/url-formatter';

export type AvatarProps = {
  className?: string;
  image?: string | null;
  username?: string;
  onClick?: (event: React.BaseSyntheticEvent) => void;
  onMouseOver?: (event: React.BaseSyntheticEvent) => void;
  variant?: 'circle' | 'square';
};

export const Avatar = (props: AvatarProps) => {
  const {
    className,
    image,
    variant = 'circle',
    username = 'no-name',
    onClick = () => undefined,
    onMouseOver = () => undefined,
  } = props;

  const nameStr = username || '';

  return (
    <ReAvatar.Avatar
      className={className}
      shape={variant}
      data-testid="avatar"
      onClick={onClick}
      onMouseOver={onMouseOver}
      role="button"
      title={username}
    >
      <ReAvatar.AvatarImage
        src={UrlFormatter.media(image)}
        alt={nameStr}
        className="aspect-none size-full"
        data-testid="avatar-img"
      />
      <ReAvatar.AvatarFallback>{nameStr}</ReAvatar.AvatarFallback>
    </ReAvatar.Avatar>
  );
};
