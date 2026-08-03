import type { ForwardedRef } from 'react';
import { forwardRef } from 'react';
import Link from 'next/link';

import type { RoutingLinkProps } from '~shared/config/routing';
import { Routing } from '~shared/config/routing';

export interface TitleLinkProps extends Routing.Title.TitleDetailRoute, RoutingLinkProps {
  baseDomain?: string;
  disableLink?: boolean;
}

export const TitleLink = forwardRef(
  (props: TitleLinkProps, ref: ForwardedRef<HTMLAnchorElement>) => {
    const { dir, content, tab, children, disableLink, baseDomain = '', onClick, ...rest } = props;

    const href = disableLink
      ? '#'
      : `${baseDomain}${Routing.Title.detail({ params: { dir, content, tab } })}`;

    return (
      <Link
        {...rest}
        prefetch={false}
        href={href}
        onClick={(e) => {
          if (disableLink) e.preventDefault();
          onClick?.(e);
        }}
        ref={ref}
      >
        {children}
      </Link>
    );
  }
);
