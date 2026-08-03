'use client';
import type { CSSProperties, FC } from 'react';
import Link from 'next/link';

import { Button } from '@re/ui-kit/ui/button';
import { Slot } from '@re/ui-kit/ui/slot';

import { BaseImage } from '~features/error-view/ui/base-image';
import { UrlFormatter } from '~shared/utils/url-formatter';

import { ErrorBase } from './error-base';

interface Error403Props {
  text?: string;
  className?: string;
  style?: CSSProperties;
  withImage?: boolean;
  overrideStatus?: number;
  abort?: string | (() => void);
}

export const Error403: FC<Error403Props> = (props) => {
  const { text = props.text || 'Недоступен контент', withImage, abort, ...rest } = props;
  const isHref = typeof abort === 'string';
  const Comp = isHref ? Link : Slot;
  const linkProps = isHref ? { href: abort } : undefined;

  return (
    <ErrorBase
      image={
        withImage ? (
          <BaseImage width={288} height={358} src={UrlFormatter.media('public/errors/404.webp')} />
        ) : null
      }
      status={props?.overrideStatus ?? 403}
      text={text}
      actions={
        <Button onClick={!isHref ? abort : undefined} color="primary">
          {/*@ts-ignore*/}
          <Comp {...linkProps}>Доступная вкладка</Comp>
        </Button>
      }
      {...rest}
    />
  );
};
