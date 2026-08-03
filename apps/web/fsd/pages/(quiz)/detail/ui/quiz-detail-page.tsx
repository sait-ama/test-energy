'use client';

import { Suspense } from 'react';

import { Container } from '~shared/ui/container';

import { Quiz } from './quiz';

export interface QuizDetailPageProps {}

export const QuizDetailPage = () => {
  return (
    <Container slim className="mt-5 flex px-3 py-4">
      <Suspense fallback={null}>
        <Quiz />
      </Suspense>
    </Container>
  );
};
