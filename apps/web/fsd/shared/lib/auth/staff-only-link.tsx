'use client';
import Link from 'next/link';

import type { RoutingLinkProps } from '~shared/config/routing';
import { useSession } from '~shared/lib/session/use-session';

interface StaffOnlyLinkProps extends RoutingLinkProps {
  href: string;
}

export const StaffOnlyLink = ({
  ref,
  ...props
}: StaffOnlyLinkProps & {
  ref?: React.RefObject<HTMLAnchorElement>;
}) => {
  const { children, ...rest } = props;
  const user = useSession();

  if (!user?.is_staff) return null;

  return (
    <Link shallow={false} prefetch={false} ref={ref} {...rest}>
      {children}
    </Link>
  );
};
