import type { PropsWithChildren } from 'react';

import type { NextPageParams } from '~shared/types/next';
import { Container } from '~shared/ui/container';

import 'react-image-gallery/styles/css/image-gallery.css';

export default async ({ children }: PropsWithChildren & NextPageParams<never, { dir: string }>) => {
  return (
    <Container
      slim
      className="flex h-screen flex-col overflow-hidden px-0 md:mt-0 md:h-screen md:min-h-screen md:pt-0 md:pt-[68px] md:pb-0"
    >
      {children}
    </Container>
  );
};
