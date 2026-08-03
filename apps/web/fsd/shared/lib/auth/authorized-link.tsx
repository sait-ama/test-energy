'use client';

import type { MouseEventHandler } from 'react';
import type { LinkProps } from 'next/link';
import Link from 'next/link';

import { Slot } from '@re/ui-kit/ui/slot';

import type { RoutingLinkProps } from '~shared/config/routing';
import { useAuthModal } from '~shared/lib/auth/use-auth-modal';
import { useLogged } from '~shared/lib/session/use-logged';

interface AuthorizedLinkProps extends RoutingLinkProps {
  asChild?: boolean;
  href?: LinkProps['href'];
}

export const AuthorizedLink = ({ asChild, children, ...rest }: AuthorizedLinkProps) => {
  const logged = useLogged();
  const { open } = useAuthModal();

  const Component = asChild ? Slot : Link;

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (!logged) {
      e.preventDefault();
      e.stopPropagation();
      open();
    }
  };

  return (
    <Component onClick={handleClick} {...rest}>
      {children}
    </Component>
  );
};
