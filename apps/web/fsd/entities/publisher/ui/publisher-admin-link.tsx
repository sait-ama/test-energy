import type { ComponentType } from 'react';
import Link from 'next/link';

import type { ButtonProps } from '@re/ui-kit/ui/button';
import { Button } from '@re/ui-kit/ui/button';
import { cn } from '@re/ui-kit/utils/cn';

import { useCurrentPublisher } from '~entities/publisher/model/hooks';

export type PublisherAdminLinkProps = ButtonProps;
export const PublisherAdminLink = ({ className, ...props }: PublisherAdminLinkProps) => {
  const { admin_link } = useCurrentPublisher((v) => v.props).data!;

  if (!admin_link) return null;

  return (
    <Link shallow={false} prefetch={false} href={admin_link}>
      <Button circle size="sm" className={cn('mr-[4px]', className)} {...props}>
        A
      </Button>
    </Link>
  );
};

export function withAdminLink(Component: ComponentType, adminLinkProps: PublisherAdminLinkProps) {
  return function (props: any) {
    return (
      <>
        <Component {...props} />
        <PublisherAdminLink {...adminLinkProps} />
      </>
    );
  };
}
