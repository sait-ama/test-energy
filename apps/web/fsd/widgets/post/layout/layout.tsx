'use server';
import type { PropsWithChildren } from 'react';
import React from 'react';

import { cn } from '@re/ui-kit/utils/cn';

import { Container } from '~shared/ui/container';

export const ForumLayout = async ({ children }: PropsWithChildren) => (
  <Container slim className={cn('flex gap-4 px-1 py-1 md:py-4')}>
    {children}
  </Container>
);
