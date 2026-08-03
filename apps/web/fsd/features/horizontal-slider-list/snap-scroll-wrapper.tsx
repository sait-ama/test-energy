import { cn } from '@re/ui-kit/utils/cn';

import { Container } from '~shared/ui/container';

export const SnapScrollWrapper = ({ children, slim, className }) => (
  <Container slim={slim}>
    <div
      className={cn(
        'my-2 flex snap-x snap-mandatory list-none flex-row overflow-x-auto overflow-y-hidden scroll-smooth p-0 pr-4 whitespace-nowrap lg:snap-none lg:overflow-hidden lg:whitespace-normal',
        className
      )}
    >
      {children}
    </div>
  </Container>
);
