import { ComponentProps } from 'react';

import { Container } from '~shared/ui/container';

export const CardCollectionContainer = ({
  children,
  className,
  ...props
}: ComponentProps<'div'>) => {
  return (
    <Container layout="tiny" className="my-8">
      {children}
    </Container>
  );
};
